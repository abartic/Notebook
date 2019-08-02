import { DriveOperations } from './../drive/drive_operations';
import { LogsManager } from './../logs/logs-manager';
import { SheetsCommonOperations, eFileOperationType } from "./sheets_common_operations";
import { SheetsMgr } from "../common/sheets-mgr";
import * as fs from 'fs';
import * as path from 'path';
import { KeyedCollection } from "../utils/dictionary";

import { IPropInfo } from "../models/base-entity";
import { eFieldDataType } from "../common/enums";
import * as Config from "config";
var {google: googleApi} = require('googleapis');
var sheets = googleApi.sheets('v4');

export class SheetsManagementOperations {
    static deleteMetadata(accessToken: string, domainId: string, spreadsheetNames) {
        let accountSpreadsheets: Array<ISpreadsheet> = new Array<ISpreadsheet>();
        let spreadsheetReqDefinition = null;
        let data = fs.readFileSync(path.join(__dirname, '../json/base-spreadsheet.json'), 'utf8');
        spreadsheetReqDefinition = JSON.parse(data);

        let spreadsheet_definitions = new KeyedCollection();
        for (let spreadsheetName of spreadsheetNames) {
            data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
            let spreadsheetDefinition = JSON.parse(data);
            spreadsheet_definitions.Add(spreadsheetName, spreadsheetDefinition);
        }

        let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
        return SheetsMgr.uniqueInstance.get(accessToken, domainId)
            .then(spreadsheetsSet => {

                if (!spreadsheetsSet) {
                    return Promise.reject({ error: 'Sheets not created!' });
                }

                let calls = [];
                for (let spreadsheet of spreadsheetsSet.spreadsheets) {
                    let deleteMetadataReq = {
                        spreadsheetId: spreadsheet.spreadsheetID,
                        includeSpreadsheetInResponse: false,
                        resource: {
                            requests: []
                        },
                        auth: oauth2Client,
                    };
                    deleteMetadataReq.resource.requests.push({
                        "deleteDeveloperMetadata": {
                            "dataFilter": {
                                "developerMetadataLookup": {
                                    "metadataKey": "lock_key"
                                }
                            }
                        }
                    });

                    calls.push(new Promise((cb) => {
                        sheets.spreadsheets.batchUpdate(deleteMetadataReq, function (err, result) {
                            if (err) {
                                cb({ error: err });
                            }
                            else {
                                cb({ error: null });
                            }
                        });

                    }));

                }
                return Promise.all(calls);
            })
            .then(results => {
                if (results.find(r => r.error !== null)) {
                    return Promise.reject({ error: 'Errors. Retry!' + results });
                }
                else {
                    return Promise.resolve({ error: null });
                }
            })
            .catch(err => {
                return Promise.reject({ error: err });
            });

    }

    static createSpreadsheet(accessToken: string, domainId: string,
        userId, spreadsheetNames) {
        let accountSpreadsheets: Array<ISpreadsheet> = new Array<ISpreadsheet>();
        let spreadsheetReqDefinition = null;


        if (domainId === null)
            return Promise.reject({ error: 'Invalid domain!' });

        let data = fs.readFileSync(path.join(__dirname, '../json/base-spreadsheet.json'), 'utf8');
        spreadsheetReqDefinition = JSON.parse(data);

        let spreadsheet_definitions = new KeyedCollection();
        for (let spreadsheetName of spreadsheetNames) {
            data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
            let spreadsheetDefinition = JSON.parse(data);
            spreadsheet_definitions.Add(spreadsheetName, spreadsheetDefinition);
        }

        return SheetsMgr.uniqueInstance.get(accessToken, domainId)
            .then(spreadsheetsSet => {

                if (spreadsheetsSet) {
                    return Promise.reject({ error: 'Sheets already created!' });
                }

                let calls_spreadsheet = [];
                //let repeatCellsDict = new KeyedCollection();
                for (let spreadsheetName of spreadsheetNames) {

                    calls_spreadsheet.push(new Promise((cb, cerr) => {

                        let spreadsheetDefinition = spreadsheet_definitions.Item(spreadsheetName);

                        let spreadsheetReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.spreadsheet));
                        spreadsheetReq.properties.title = spreadsheetDefinition['spreadsheetName'];

                        for (let sheet of spreadsheetDefinition['sheets']) {

                            let sheetReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.sheet));
                            sheetReq.properties.title = sheet.sheetName;
                            spreadsheetReq.sheets.push(sheetReq);
                            let uniqueRecord = (sheet.sheetType === 'uniqueRecord');

                            if (sheet.formula) {
                                sheetReq.data[0].rowData[0].values.push({
                                    "userEnteredValue": {
                                        "formulaValue": '=' + sheet.formula
                                    }
                                });


                            }
                            else {
                                sheetReq.properties.gridProperties.columnCount = 2 + sheet.fields.length;
                                sheetReq.data[0].rowData[0].values.push({
                                    "userEnteredValue": {
                                        //"formulaValue": '=ARRAYFORMULA(ROW($A:$A))'
                                        "stringValue": 'rowid'
                                    },
                                    "userEnteredFormat": {
                                        "numberFormat": {
                                            "type": "NUMBER"
                                        }
                                    }
                                });

                                sheetReq.data[0].rowData[0].values.push({
                                    "userEnteredValue": {
                                        "stringValue": "uid"
                                    },
                                    "userEnteredFormat": {
                                        "numberFormat": {
                                            "type": "TEXT"
                                        }
                                    }
                                });

                                if (uniqueRecord) {
                                    sheetReq.data[0].rowData.push({
                                        "values": []
                                    });
                                    sheetReq.data[0].rowData[1].values.push({
                                        "userEnteredValue": {
                                            "formulaValue": "=ROW()"
                                        },
                                        "userEnteredFormat": {
                                            "numberFormat": {
                                                "type": "TEXT"
                                            }
                                        }
                                    });
                                    sheetReq.data[0].rowData[1].values.push({
                                        "userEnteredValue": {
                                            "stringValue": "1"
                                        },
                                        "userEnteredFormat": {
                                            "numberFormat": {
                                                "type": "TEXT"
                                            }
                                        }
                                    });
                                }

                                let ti = 0;
                                for (const field of sheet.fields) {

                                    let fieldDef = {
                                        "userEnteredValue": {
                                            "stringValue": field
                                        },
                                        "userEnteredFormat": {
                                            "numberFormat": {
                                                "type": "TEXT",
                                                "pattern": undefined
                                            }
                                        }
                                    };


                                    sheetReq.data[0].rowData[0].values.push(fieldDef);

                                    ti += 1;
                                }
                            }
                        }

                        let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
                        sheets.spreadsheets.create({
                            resource: spreadsheetReq,
                            auth: oauth2Client
                        },
                            function (err, ssheet) {
                                if (err) {
                                    cerr(err);
                                }
                                else {

                                    cb({
                                        "spreadsheetDefinition": spreadsheetDefinition,
                                        "spreadsheet": ssheet
                                    });


                                }
                            });
                    }));
                }

                return Promise.all(calls_spreadsheet);
            })
            .then(spreadsheets_info => {

                let calls_sheet = [];
                for (let spreadsheet_info of spreadsheets_info) {
                    let spreadsheet = spreadsheet_info.spreadsheet;
                    let spreadsheetDefinition = spreadsheet_info['spreadsheetDefinition'];
                    let accountSpreadsheet = <ISpreadsheet>{};
                    accountSpreadsheets.push(accountSpreadsheet);
                    accountSpreadsheet.spreadsheetName = spreadsheetDefinition.spreadsheetName;
                    accountSpreadsheet.spreadsheetID = spreadsheet.data.spreadsheetId;
                    accountSpreadsheet.sheets = new Array<ISheet>();

                    for (const sheet of spreadsheet.data.sheets) {

                        let accountSheet = <ISheet>{};
                        accountSheet.sheetName = sheet.properties.title;
                        accountSheet.sheetID = sheet.properties.sheetId;
                        accountSpreadsheet.sheets.push(accountSheet);

                        var fields_rowReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.fields_row));
                        fields_rowReq.addProtectedRange.protectedRange.range.sheetId = sheet.properties.sheetId;
                        fields_rowReq.addProtectedRange.protectedRange.editors.users.push(userId);

                        // var sort_fields_rowReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.sort_fields_row));
                        // sort_fields_rowReq.sortRange.range.sheetId = sheet.properties.sheetId;

                        var block_fields_rowReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.block_fields_row));
                        block_fields_rowReq.updateSheetProperties.properties.sheetId = sheet.properties.sheetId;

                        // var rowid_columnProtectedRangeReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.rowid_column));
                        // rowid_columnProtectedRangeReq.addProtectedRange.protectedRange.range.sheetId = sheet.properties.sheetId;
                        // rowid_columnProtectedRangeReq.addProtectedRange.protectedRange.editors.users.push(userId);

                        var block_rowid_columnReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.block_rowid_column));
                        block_rowid_columnReq.updateSheetProperties.properties.sheetId = sheet.properties.sheetId;

                        //rowid_columnProtectedRangeReq,
                        var requests = [fields_rowReq, block_fields_rowReq, block_rowid_columnReq];

                        var sheetDef = spreadsheetDefinition.sheets.find(function (item) { return item.sheetName === sheet.properties.title; });
                        let fieldIndex = 0;

                        // for (const field of sheetDef.fields) {

                        //     const metadataFieldReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.meta_data_column));
                        //     metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.startIndex = fieldIndex;
                        //     metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.endIndex = ++fieldIndex;
                        //     metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.sheetId = sheet.properties.sheetId;
                        //     metadataFieldReq.createDeveloperMetadata.developerMetadata.metadataValue = sheetDef.sheetName + '.' + field;
                        //     requests.push(metadataFieldReq);
                        // }

                        let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
                        calls_sheet.push(new Promise((cb, cerr) => {
                            sheets.spreadsheets.batchUpdate(
                                {
                                    spreadsheetId: spreadsheet.data.spreadsheetId,
                                    includeSpreadsheetInResponse: false,
                                    resource: {
                                        requests: requests
                                    },
                                    auth: oauth2Client,
                                },
                                function (err, result) {
                                    if (err) {
                                        cerr(err);
                                    }
                                    else {
                                        cb();
                                    }
                                });
                        }));
                    }
                }

                return Promise.all(calls_sheet);
            })
            .then(() => {

                const uuidv1 = require('uuid/v1');

                let accountsSet: IAccountsSet = {
                    //id : domainId,
                    domainId: domainId,
                    //domainName: domainName,
                    accounts: new Array<IAccount>(),
                };
                let folderId;
                let calls_file = [];
                return DriveOperations.writeConfigFile(accessToken, domainId, eFileOperationType.folder, null, null, null)
                    .then(fileId => {
                        folderId = fileId;
                        // accountsSet.accounts.push({
                        //     accountName: req.session['userId'],
                        //     role: "proj-admin",
                        //     accountDescr: "google-account",
                        //     enrollmentDate: Date.now()
                        // });

                        return DriveOperations.writeConfigFile(accessToken, domainId, eFileOperationType.accounts, null, folderId, JSON.stringify(accountsSet));
                    })
                    .then(accountsFileId => {
                        let spreadsheetsSet: ISpreadsheetsSet = {
                            accountsFileId: accountsFileId,
                            spreadsheets: accountSpreadsheets
                        };

                        calls_file = [DriveOperations.writeConfigFile(accessToken, domainId, eFileOperationType.sheets, null, folderId, JSON.stringify(spreadsheetsSet))];

                        for (let ash of accountSpreadsheets)
                            calls_file.push(DriveOperations.writeConfigFile(accessToken, domainId, eFileOperationType.moveToFolder, ash.spreadsheetID, folderId, null));

                        return Promise.all(calls_file);

                    })
                    .then(() => {

                        SheetsManagementOperations.enrolleUserSpreadsheet(accessToken, domainId, Config.get<string>("service_account"), "reader");

                        return Promise.resolve({ error: null });
                    });
            })
            .catch(err => {
                LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));

                if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject({ error: err });
            })

    }

    static enrolleUserSpreadsheet(accessToken: string, domainId: string, enrolledUser, dataManagementRole: string = 'writer') {

        let accountsFileId = null;
        let spreadsheets = null;
        let sheetsFileId = null;
        let accountsSetUpdated = null;
        let permissionIds = [];

        return SheetsMgr.uniqueInstance.get(accessToken, domainId)
            .then(spreadsheetsSet => {
                if (spreadsheetsSet === null) {
                    return Promise.reject({ error: 'Sheets not created!' });
                }

                accountsFileId = spreadsheetsSet.accountsFileId;
                sheetsFileId = spreadsheetsSet['fileId'];
                spreadsheets = spreadsheetsSet.spreadsheets;


                return DriveOperations.getConfigFile<IAccountsSet>(accessToken, accountsFileId, domainId, eFileOperationType.accounts);

            })
            .then(accountsSet => {

                if (accountsSet.accounts.find(a => a.accountName === enrolledUser))
                    return Promise.reject({ error: 'User already enrolled!' })

                accountsSetUpdated = accountsSet;
                let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
                let spreadsheetCount = spreadsheets.length;
                let spreadsheetIndex = 1;
                
                const drive = googleApi.drive('v3');
                let calls = [];

                for (let spreadsheet of spreadsheets) {
                    calls.push(new Promise((cb, err_cb) => {
                        let role = spreadsheet.spreadsheetName === 'system' ? 'writer' : dataManagementRole;
                        drive.permissions.create({
                            fileId: spreadsheet.spreadsheetID,
                            resource: {
                                "role": role,
                                "type": "user",
                                "emailAddress": enrolledUser
                            },
                            auth: oauth2Client
                        },
                            function (err, result) {
                                if (err) {
                                    err_cb(false);
                                }
                                else {
                                    permissionIds.push({ fileId: spreadsheet.spreadsheetID, permissionId: result.data.id });
                                    cb(result);
                                }

                            });
                    }));
                }

                calls.push(new Promise((cb, err_cb) => {
                    drive.permissions.create({
                        fileId: accountsFileId,
                        resource: {
                            "role": "reader",
                            "type": "user",
                            "emailAddress": enrolledUser
                        },
                        auth: oauth2Client
                    },
                        function (err, result) {
                            if (err) {
                                err_cb(false);
                            }
                            else {
                                permissionIds.push({ fileId: accountsFileId, permissionId: result.data.id });
                                cb(result);
                            }

                        });
                }));

                calls.push(new Promise((cb, err_cb) => {
                    drive.permissions.create({
                        fileId: sheetsFileId,
                        resource: {
                            "role": "reader",
                            "type": "user",
                            "emailAddress": enrolledUser
                        },
                        auth: oauth2Client
                    },
                        function (err, result) {
                            if (err) {
                                err_cb(false);
                            }
                            else {
                                permissionIds.push({ fileId: sheetsFileId, permissionId: result.data.id });
                                cb(result);
                            }

                        });
                }));



                return Promise.all(calls);
            })
            .then(r => {
                accountsSetUpdated.accounts.push({
                    accountName: enrolledUser,
                    role: "datawriter",
                    accountDescr: "google-account",
                    enrollmentDate: Date.now(),
                    domainId: accountsSetUpdated.domainId,
                    permissions: permissionIds
                });

                return DriveOperations.writeConfigFile(accessToken, domainId, eFileOperationType.accounts, accountsFileId, null, JSON.stringify(accountsSetUpdated));
            })
            .then(r => { return Promise.resolve({ error: null }); })
            .catch(err => {
                if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject({ error: err });
            });

    }

    static disenrolleUserSpreadsheet(accessToken: string, domainId: string, disenrolledUser) {

        let accountsFileId = null;
        let spreadsheets = null;
        let sheetsFileId = null;
        let accountIdex = null;
        let accountsSetUpdated = null;
        return SheetsMgr.uniqueInstance.get(accessToken, domainId)
            .then(spreadsheetsSet => {
                if (spreadsheetsSet === null) {
                    return Promise.reject({ error: 'Sheets not created!' });
                }

                accountsFileId = spreadsheetsSet.accountsFileId;
                sheetsFileId = spreadsheetsSet['fileId'];
                spreadsheets = spreadsheetsSet.spreadsheets;




                return DriveOperations.getConfigFile<IAccountsSet>(accessToken, accountsFileId, domainId, eFileOperationType.accounts);
            })
            .then(accountsSet => {
                accountsSetUpdated = accountsSet;
                accountIdex = accountsSet.accounts.findIndex(a => a.accountName === disenrolledUser);
                if (accountIdex < 0)
                    return Promise.reject({ error: 'User not enrolled!' })


                let account = accountsSet.accounts[accountIdex];
                let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
                const drive = googleApi.drive('v3');
                let calls = [];
                for (let permission of account.permissions) {
                    calls.push(new Promise((cb, err_cb) => {

                        drive.permissions.delete({
                            fileId: permission.fileId,
                            permissionId: permission.permissionId,
                            auth: oauth2Client
                        },
                            function (err, result) {
                                if (err) {
                                    err_cb(false);
                                }
                                else {
                                    cb(result);
                                }

                            });
                    }));
                }

                return Promise.all(calls);
            })
            .then(r => {
                accountsSetUpdated.accounts.splice(accountIdex, 1);
                return DriveOperations.writeConfigFile(accessToken, domainId, eFileOperationType.accounts, accountsFileId, null, JSON.stringify(accountsSetUpdated));
            })
            .then(r => { return Promise.resolve({ error: null }); })
            .catch(err => {
                if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject({ error: err });
            });

    }

    static getSpreadsheetInfo(accessToken: string, domainId: string, spreadsheetName, sheetName, entityName) {
        let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
        return SheetsMgr.uniqueInstance.get(accessToken, domainId)
            .then(spreadsheetsSet => {

                if (spreadsheetsSet === null) {
                    return Promise.reject({ error: 'Sheets not created!' });
                }

                p_spreadsheets = spreadsheetsSet['spreadsheets'];

                p_spreadsheet = <ISpreadsheet>p_spreadsheets.find(s => s.spreadsheetName === spreadsheetName);
                if (p_spreadsheet !== undefined) {
                    p_sheet = <ISheet>p_spreadsheet.sheets.find(s => s.sheetName === sheetName);
                    return Promise.resolve()
                }

                if (p_sheet === undefined) {
                    return Promise.reject({ error: 'Sheets missing!' });
                }
            }).then(() => {

                let spreadsheet: ISpreadsheet = undefined;
                let sheet: ISheet = undefined;

                let data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
                spreadsheet = <ISpreadsheet>(JSON.parse(data));
                if (spreadsheet !== undefined) {
                    sheet = spreadsheet.sheets.find(s => s.sheetName === sheetName);
                }

                spreadsheet.spreadsheetID = p_spreadsheet.spreadsheetID;
                sheet.sheetID = p_sheet.sheetID;

                if (sheet.isView !== true) {
                    //add static fields
                    sheet.fields.splice(0, 0, 'rowid', 'uid');
                    if (sheet.fields_types)
                        sheet.fields_types.splice(0, 0, 's', 's');
                }

                let map_entity = sheet.entities.find(e => e.entityName === entityName);
                let propInfos: Array<IPropInfo> = new Array<IPropInfo>();
                let cellName = 'A';
                for (let index = 0; index < sheet.fields.length; index++) {

                    let propInfo: IPropInfo = {
                        propName: sheet.fields[index],
                        propCaption: (map_entity.caption_prefix === undefined ? '' : (map_entity.caption_prefix + '.')) + sheet.fields[index],
                        cellName: cellName,

                        dataType: !sheet.fields_types || sheet.fields_types[index] === '' ? 's' : sheet.fields_types[index],
                        mask: '',
                        path: '',
                        isHidden: false
                    };

                    if (propInfo.dataType === eFieldDataType.Numeric) {
                        propInfo.mask = "#,##0.00"
                    }
                    else if (propInfo.dataType === eFieldDataType.Integer) {
                        propInfo.mask = "#,##0"
                    }
                    else if (propInfo.dataType === eFieldDataType.Date) {
                        propInfo.mask = "dd/MM/yyyy"
                    }
                    if (sheet.hidden_fields && sheet.hidden_fields.findIndex(i => i === sheet.fields[index]) >= 0)
                        propInfo.isHidden = true;

                    if (map_entity.hidden_fields && map_entity.hidden_fields.findIndex(i => i === sheet.fields[index]) >= 0)
                        propInfo.isHidden = true;

                    cellName = String.fromCharCode(cellName.charCodeAt(0) + 1);
                    propInfos.push(propInfo);
                }


                let map_relations = (map_entity.relations !== undefined ? map_entity.relations : []);
                return {
                    spreadsheetID: spreadsheet.spreadsheetID,
                    sheetID: sheet.sheetID,
                    properties: propInfos,
                    spreadsheetName: spreadsheet.spreadsheetName,
                    sheetName: sheet.sheetName,
                    entityName: entityName,
                    isView: sheet.isView,
                    relations: map_relations,
                    fetched: true
                };

            }).catch(err => {
                if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject({ error: err });
            });

    }
}

