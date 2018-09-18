import { SheetsCommonOperations, eFileOperationType } from "./sheets_common_operations";
import { SheetsMgr } from "../common/sheets-mgr";
import * as fs from 'fs';
import * as path from 'path';
import { KeyedCollection } from "../utils/dictionary";
import { DriverRoute } from "../routes/driver_route";

import { AccountsMgr } from "../common/accounts-mgr";
import { IPropInfo } from "../models/base-entity";
let googleApi = require('googleapis');
let sheets = googleApi.sheets('v4');

export class SheetsManagementOperations {
    static deleteMetadata(accessToken: string, spreadsheetNames) {
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
        return SheetsMgr.uniqueInstance.get(accessToken)
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
                    Promise.reject({ error: 'Errors. Retry!' + results });
                }
                else {
                    Promise.resolve({});
                }
            })

    }

    static createSpreadsheet(accessToken: string, userId, spreadsheetNames) {
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

        return SheetsMgr.uniqueInstance.get(accessToken)
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
                                        "stringValue": 'uid'
                                    },
                                    "userEnteredFormat": {
                                        "numberFormat": {
                                            "type": "TEXT"
                                        }
                                    }
                                });



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

                                    if (sheet.fields_types && sheet.fields_types[ti] === 'i') {
                                        fieldDef['userEnteredFormat'] = {
                                            "numberFormat": {
                                                "type": "NUMBER",
                                                "pattern": "#,##0"
                                            }
                                        };
                                    }
                                    else if (sheet.fields_types && sheet.fields_types[ti] === 'n') {
                                        fieldDef['userEnteredFormat'] = {
                                            "numberFormat": {
                                                "type": "NUMBER",
                                                "pattern": "#,##0.00"
                                            }
                                        };
                                    }
                                    else if (sheet.fields_types && sheet.fields_types[ti] === 'd') {
                                        fieldDef['userEnteredFormat'] = {
                                            "numberFormat": {
                                                "type": "DATE",
                                                "pattern": "dd/MM/yyyy"
                                            }
                                        };
                                    }
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
                    accountSpreadsheet.spreadsheetID = spreadsheet.spreadsheetId;
                    accountSpreadsheet.sheets = new Array<ISheet>();

                    for (const sheet of spreadsheet.sheets) {

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

                        var rowid_columnProtectedRangeReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.rowid_column));
                        rowid_columnProtectedRangeReq.addProtectedRange.protectedRange.range.sheetId = sheet.properties.sheetId;
                        rowid_columnProtectedRangeReq.addProtectedRange.protectedRange.editors.users.push(userId);

                        var block_rowid_columnReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.block_rowid_column));
                        block_rowid_columnReq.updateSheetProperties.properties.sheetId = sheet.properties.sheetId;

                        var requests = [fields_rowReq, block_fields_rowReq, rowid_columnProtectedRangeReq, block_rowid_columnReq];

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
                                    spreadsheetId: spreadsheet.spreadsheetId,
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
                    id: uuidv1(),
                    accounts: new Array<IAccount>(),
                };
                let folderId;
                let calls_file = [];
                DriverRoute.writeConfigFile(accessToken, eFileOperationType.folder, null, null, null)
                    .then(fileId => {
                        folderId = fileId;
                        // accountsSet.accounts.push({
                        //     accountName: req.session['userId'],
                        //     role: "proj-admin",
                        //     accountDescr: "google-account",
                        //     enrollmentDate: Date.now()
                        // });

                        return DriverRoute.writeConfigFile(accessToken, eFileOperationType.accounts, null, folderId, JSON.stringify(accountsSet));
                    })
                    .then(accountsFileId => {
                        let spreadsheetsSet: ISpreadsheetsSet = {
                            accountsFileId: accountsFileId,
                            spreadsheets: accountSpreadsheets
                        };

                        calls_file = [DriverRoute.writeConfigFile(accessToken, eFileOperationType.sheets, null, folderId, JSON.stringify(spreadsheetsSet))];

                        for (let ash of accountSpreadsheets)
                            calls_file.push(DriverRoute.writeConfigFile(accessToken, eFileOperationType.moveToFolder, ash.spreadsheetID, folderId, null));

                        return Promise.all(calls_file);

                    })
                    .then(() => {
                        return Promise.reject({ error: null });
                    });
            })
            .catch(r => {
                if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject(r);
            })

    }

    static enrolleUserSpreadsheet(accessToken: string, enrolledUser) {

        let accountsFileId = null;
        let spreadsheets = null;
        let sheetsFileId = null;

        return SheetsMgr.uniqueInstance.get(accessToken)
            .then(spreadsheetsSet => {
                if (spreadsheetsSet === null) {
                    return Promise.reject({ error: 'Sheets not created!' });
                }

                accountsFileId = spreadsheetsSet.accountsFileId;
                sheetsFileId = spreadsheetsSet['fileId'];
                spreadsheets = spreadsheetsSet.spreadsheets;



                return AccountsMgr.uniqueInstance.getAccounts(accessToken, accountsFileId)
            })
            .then(accountsSet => {

                if (accountsSet.accounts.find(a => a.accountName === enrolledUser))
                    return Promise.reject({ error: 'User already enrolled!' })


                let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
                let spreadsheetCount = spreadsheets.length;
                let spreadsheetIndex = 1;
                const drive = googleApi.drive({ version: 'v3' });
                let calls = [];
                for (let spreadsheet of spreadsheets) {
                    calls.push(new Promise((cb, err_cb) => {
                        drive.permissions.create({
                            fileId: spreadsheet.spreadsheetID,
                            resource: {
                                "role": "writer",
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
                                cb(result);
                            }

                        });
                }));

                accountsSet.accounts.push({
                    accountName: enrolledUser,
                    role: "writer",
                    accountDescr: "google-account",
                    enrollmentDate: Date.now()
                });

                calls.push(DriverRoute.writeConfigFile(accessToken, eFileOperationType.accounts, accountsFileId, null, JSON.stringify(accountsSet)));
                return Promise.all(calls);
            })
            .then(r => { return Promise.reject({ error: null }); })
            .catch(r => {
                if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.resolve(r);
            });

    }

    static getSpreadsheetInfo(accessToken: string, spreadsheetName, sheetName, entityName) {
        let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
        return SheetsMgr.uniqueInstance.get(accessToken)
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


                let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
                sheets.spreadsheets.get(
                    {
                        spreadsheetId: spreadsheet.spreadsheetID,
                        ranges: [sheet.sheetName + '!1:1'],
                        includeGridData: true,
                        fields: "sheets(properties.title,data.rowData.values(effectiveValue.stringValue,effectiveFormat.numberFormat))",
                        auth: oauth2Client,
                    },
                    function (err, result) {
                        if (err) {
                            return Promise.reject({ error: err });
                        }
                        let columns = undefined;
                        try {
                            columns = result.sheets[0]['data'][0]['rowData'][0]['values'];

                            let propInfos: Array<IPropInfo> = new Array<IPropInfo>();
                            let cellName = 'A';
                            for (let column of columns) {
                                if (column['effectiveValue'] === undefined)
                                    continue;

                                let propInfo: IPropInfo = {
                                    propName: column['effectiveValue']['stringValue'],
                                    cellName: cellName,
                                    onlyEdit: true,
                                    dataType: column['effectiveFormat'] === undefined ? 'TEXT' : column['effectiveFormat']['numberFormat']['type'],
                                    mask: column['effectiveFormat'] === undefined ? '' : column['effectiveFormat']['numberFormat']['pattern'],
                                    path: ''
                                };
                                cellName = String.fromCharCode(cellName.charCodeAt(0) + 1);
                                propInfos.push(propInfo);
                            }

                            return Promise.resolve({
                                spreadsheetID: spreadsheet.spreadsheetID,
                                sheetID: sheet.sheetID,
                                properties: propInfos,
                                spreadsheetName: spreadsheet.spreadsheetName,
                                sheetName: sheet.sheetName,
                                entityName: entityName,
                                relations: sheet.entity.relations !== undefined ? sheet.entity.relations : []
                            });
                        }
                        catch (e) {
                            return Promise.reject({ error: e });

                        }
                    });




            }).catch(r => {
                if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject(r);
            });

    }
}
