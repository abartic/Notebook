

import { ModelFactory } from './../models/modelFactory';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import * as request from 'request-promise';
import * as fs from 'fs';
import * as path from 'path';
import { IPropInfo } from '../models/base-entity';
import acl = require('acl');

import * as Config from "config";
import { KeyedCollection } from '../utils/dictionary';
import { AppAcl } from '../acl/app-acl';
import { SheetsMgr } from '../common/sheets-mgr';
import { AccountsMgr } from '../common/accounts-mgr';

var googleApi = require('googleapis');
var sheets = googleApi.sheets('v4');


export interface ISelectObj {

    spreadsheetName: string;
    sheetName: string;
    entityName: string;
    select: string;
    addSchema: boolean;
}

export enum eFileOperationType {
    folder = "f",
    moveToFolder = "mf",
    accounts = "accounts",
    sheets = "sheets",
}

export class SheetRoute extends BaseRoute {

    constructor() {
        super();
    }


    public static create(router: Router) {

        router.post('/sheetdata/create-spreadsheet',
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetNames } = req.body;
                let token = req.session['google_access_token'];

                var googleApi = require('googleapis');
                var googleAuth = require('google-auth-library');
                var auth = new googleAuth();
                var oauth2Client = new auth.OAuth2();
                oauth2Client.credentials = {
                    access_token: token
                };

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

                SheetsMgr.uniqueInstance.get(token)
                    .then(spreadsheetsSet => {

                        if (spreadsheetsSet) {
                            return Promise.reject({ error: 'Sheets already created!' });
                        }

                        let calls_spreadsheet = [];
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
                                            }
                                        });
                                        sheetReq.data[0].rowData[0].values.push({
                                            "userEnteredValue": {
                                                "stringValue": 'uid'
                                            }
                                        });
                                        for (const field of sheet.fields) {

                                            sheetReq.data[0].rowData[0].values.push({
                                                "userEnteredValue": {
                                                    "stringValue": field
                                                }
                                            });
                                        }
                                    }
                                }


                                sheets.spreadsheets.create({
                                    resource: spreadsheetReq,
                                    auth: oauth2Client
                                },
                                    function (err, result) {
                                        if (err) {
                                            cerr(err);
                                        }
                                        else {
                                            cb({
                                                "spreadsheetDefinition": spreadsheetDefinition,
                                                "spreadsheet": result
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
                                fields_rowReq.addProtectedRange.protectedRange.editors.users.push(req.session['userId']);

                                var block_fields_rowReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.block_fields_row));
                                block_fields_rowReq.updateSheetProperties.properties.sheetId = sheet.properties.sheetId;

                                var rowid_columnProtectedRangeReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.rowid_column));
                                rowid_columnProtectedRangeReq.addProtectedRange.protectedRange.range.sheetId = sheet.properties.sheetId;
                                rowid_columnProtectedRangeReq.addProtectedRange.protectedRange.editors.users.push(req.session['userId']);

                                var block_rowid_columnReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.block_rowid_column));
                                block_rowid_columnReq.updateSheetProperties.properties.sheetId = sheet.properties.sheetId;

                                var requests = [fields_rowReq, block_fields_rowReq, rowid_columnProtectedRangeReq, block_rowid_columnReq];

                                var sheetDef = spreadsheetDefinition.sheets.find(function (item) { return item.sheetName === sheet.properties.title; });
                                let fieldIndex = 0;

                                for (const field of sheetDef.fields) {

                                    const metadataFieldReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.meta_data_column));
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.startIndex = fieldIndex;
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.endIndex = ++fieldIndex;
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.sheetId = sheet.properties.sheetId;
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.metadataValue = sheetDef.sheetName + '.' + field;
                                    requests.push(metadataFieldReq);
                                }


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
                        SheetRoute.writeConfigFile(req, eFileOperationType.folder, null, null, null)
                            .then(fileId => {
                                folderId = fileId;
                                // accountsSet.accounts.push({
                                //     accountName: req.session['userId'],
                                //     role: "proj-admin",
                                //     accountDescr: "google-account",
                                //     enrollmentDate: Date.now()
                                // });

                                return SheetRoute.writeConfigFile(req, eFileOperationType.accounts, null, folderId, JSON.stringify(accountsSet));
                            })
                            .then(accountsFileId => {
                                let spreadsheetsSet: ISpreadsheetsSet = {
                                    accountsFileId: accountsFileId,
                                    spreadsheets: accountSpreadsheets
                                };

                                calls_file = [SheetRoute.writeConfigFile(req, eFileOperationType.sheets, null, folderId, JSON.stringify(spreadsheetsSet))];

                                for (let ash of accountSpreadsheets)
                                    calls_file.push(SheetRoute.writeConfigFile(req, eFileOperationType.moveToFolder, ash.spreadsheetID, folderId, null));

                                Promise.all(calls_file);

                            })
                            .then(() => {
                                res.send({ error: null });
                            });
                    })
                    .catch(r => res.send(r))
            });

        router.post('/sheetdata/enrolle-user-spreadsheet',
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {

                const { enrolledUser } = req.body;
                let token = req.session['google_access_token'];
                let accountsFileId = null;
                let spreadsheets = null;
                let sheetsFileId = null;
                SheetsMgr.uniqueInstance.get(token)
                    .then(spreadsheetsSet => {
                        if (spreadsheetsSet === null) {
                            return Promise.reject({ error: 'Sheets not created!' });
                        }

                        accountsFileId = spreadsheetsSet.accountsFileId;
                        sheetsFileId = spreadsheetsSet['fileId'];
                        spreadsheets = spreadsheetsSet.spreadsheets;

                       

                        return AccountsMgr.uniqueInstance.getAccounts(token, accountsFileId)
                    })
                    .then(accountsSet => {

                        if (accountsSet.accounts.find(a => a.accountName === enrolledUser))
                            return Promise.reject({ error: 'User already enrolled!' })

                        var googleApi = require('googleapis');
                        var googleAuth = require('google-auth-library');
                        var auth = new googleAuth();
                        var oauth2Client = new auth.OAuth2();
                        oauth2Client.credentials = {
                            access_token: req.session['google_access_token']
                        };

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

                        calls.push(SheetRoute.writeConfigFile(req, eFileOperationType.accounts, accountsFileId, null, JSON.stringify(accountsSet)));
                        return Promise.all(calls);
                    })
                    .then(r => { return res.send({ error: null }); })
                    .catch(r => res.send(r))
            });

        router.post('/sheetdata/spreadsheet-info',
            (req: Request, res: Response, next: NextFunction) => {
                let token = req.session['google_access_token'];
                const { spreadsheetName, sheetName, entityName } = req.body;

                let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
                SheetsMgr.uniqueInstance.get(token)
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

                        var googleApi = require('googleapis');
                        var googleAuth = require('google-auth-library');
                        var sheets = googleApi.sheets('v4');

                        var auth = new googleAuth();
                        var oauth2Client = new auth.OAuth2();
                        oauth2Client.credentials = {
                            access_token: req.session['google_access_token']
                        };


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
                                    console.log(err);
                                    res.send({ error: err });
                                    return;
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
                                            mask: column['effectiveFormat'] === undefined ? '' : column['effectiveFormat']['numberFormat']['pattern']
                                        };
                                        cellName = String.fromCharCode(cellName.charCodeAt(0) + 1);
                                        propInfos.push(propInfo);
                                    }

                                    res.json({
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
                                    res.send({ error: e });
                                    return;
                                }
                            });




                    }).catch(r => {
                        res.send(r);
                    });
            });

        router.post('/sheetdata/create',
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetID, sheetName, sheetID, values } = req.body;

                const uuidv1 = require('uuid/v1');
                values.splice(0, 0, "=ROW()");
                values.splice(1, 0, uuidv1());
                SheetRoute.append(req, res, spreadsheetID, sheetName, sheetID, values);
            });

        router.post('/sheetdata/delete',
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetID, sheetName, sheetID, ID, rowid } = req.body;
                var rowIndex = rowid - 1;

                SheetRoute.clean(req, res, spreadsheetID, sheetName, sheetID, ID, rowIndex, null);
            });


        router.post('/sheetdata/update',
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetID, sheetName, sheetID, values } = req.body;

                var rowIndex = values[0] - 1;
                values[0] = "=ROW()";
                var rowid = values[1];
                SheetRoute.clean(req, res, spreadsheetID, sheetName, sheetID, rowid, rowIndex, function () {
                    SheetRoute.append(req, res, spreadsheetID, sheetName, sheetID, values);
                });

            });

        router.post('/sheetdata/select',
            (req: Request, res: Response, next: NextFunction) => {
                let token = req.session['google_access_token'];
                const { spreadsheetName, sheetName, entityName, select, addSchema } = req.body as ISelectObj;

                let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
                SheetsMgr.uniqueInstance.get(token)
                    .then(spreadsheetsSet => {

                        if (spreadsheetsSet === null) {
                            return Promise.reject({ error: 'Sheets not created!' });
                        }
                        

                        p_spreadsheets = spreadsheetsSet.spreadsheets;

                        p_spreadsheet = <ISpreadsheet>p_spreadsheets.find(s => s.spreadsheetName === spreadsheetName);
                        if (p_spreadsheet !== undefined) {
                            p_sheet = <ISheet>p_spreadsheet.sheets.find(s => s.sheetName === sheetName);
                            return Promise.resolve()
                        }

                        if (p_sheet === undefined) {
                            return Promise.reject({ error: 'Sheets missing!' });
                        }
                    }).then(() => {


                        var googleApi = require('googleapis');
                        var googleAuth = require('google-auth-library');
                        var auth = new googleAuth();
                        var oauth2Client = new auth.OAuth2();
                        oauth2Client.credentials = {
                            access_token: req.session['google_access_token']
                        };

                        var jsonpClient = require('jsonp-client');
                        var url = "https://docs.google.com/spreadsheets/d/" + p_spreadsheet.spreadsheetID +
                            "/gviz/tq?tqx=responseHandler:handleTqResponse" +
                            "&sheet=" + sheetName +
                            "&headers=1" +
                            "&tq=" + encodeURI(select) +
                            "&access_token=" + req.session['google_access_token']

                        jsonpClient(url,
                            function (err, data) {
                                if (err) {
                                    res.json({ error: err });
                                }
                                else if (data.status === 'error') {
                                    res.json({
                                        error: data.errors
                                    });
                                }
                                else {
                                    var entities = [];
                                    var schema = data.table.cols;
                                    for (const row of data.table.rows) {
                                        var ent = ModelFactory.uniqueInstance.create(entityName.toLowerCase());
                                        var i = 0;
                                        for (const col of data.table.cols) {
                                            if (row.c[i] && row.c[i].v) {
                                                ent[col.label] = row.c[i].v;
                                            }
                                            i += 1;
                                        }
                                        entities.push(ent)
                                    }
                                    let result = {};
                                    result['rows'] = entities;
                                    if (addSchema === true)
                                        result['schema'] = schema;
                                    res.json(result);
                                }
                            });

                    }).catch(r => res.send(r));
            });

        router.post('/sheetdata/getscalar',
            (req: Request, res: Response, next: NextFunction) => {
                let token = req.session['google_access_token'];
                const { spreadsheetName, sheetName, entityName, select } = req.body as ISelectObj;

                let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
                SheetsMgr.uniqueInstance.get(token)
                    .then(spreadsheetsSet => {
                        if (spreadsheetsSet === null) {
                            return Promise.reject({ error: 'Sheets not created!' });
                        }
                        

                        p_spreadsheets = spreadsheetsSet.spreadsheets;

                        p_spreadsheet = <ISpreadsheet>p_spreadsheets.find(s => s.spreadsheetName === spreadsheetName);
                        if (p_spreadsheet !== undefined) {
                            p_sheet = <ISheet>p_spreadsheet.sheets.find(s => s.sheetName === sheetName);
                            return Promise.resolve()
                        }

                        if (p_sheet === undefined) {
                            return Promise.reject({ error: 'Sheets missing!' });
                        }
                    }).then(() => {

                        var googleApi = require('googleapis');
                        var googleAuth = require('google-auth-library');
                        var auth = new googleAuth();
                        var oauth2Client = new auth.OAuth2();
                        oauth2Client.credentials = {
                            access_token: req.session['google_access_token']
                        };

                        var jsonpClient = require('jsonp-client');
                        var url = "https://docs.google.com/spreadsheets/d/" + p_spreadsheet.spreadsheetID +
                            "/gviz/tq?tqx=responseHandler:handleTqResponse" +
                            "&sheet=" + sheetName +
                            "&headers=1" +
                            "&tq=" + encodeURI(select) +
                            "&access_token=" + req.session['google_access_token']

                        jsonpClient(url,
                            function (err, data) {
                                if (err) {
                                    res.json({ error: err });
                                }
                                else if (data.status === 'error') {
                                    res.json({
                                        error: data.errors
                                    });
                                }
                                else {
                                    let result = { scalar: 0 };
                                    for (const row of data.table.rows) {
                                        var ent = {};
                                        result['scalar'] = row.c[0].v;

                                        break;
                                    }
                                    res.json(result);
                                }
                            });


                    }).catch(r => {
                        res.send(r);
                    });;
            });





    }

    static getAuth(req: Request) {

        var googleAuth = require('google-auth-library');
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2();
        oauth2Client.credentials = {
            access_token: req.session['google_access_token']
        };

        return oauth2Client;
    }

    static clean(req: Request, res: Response, spreadsheetID, sheetName, sheetID, ID, rowid, callback) {

        var oauth2Client = SheetRoute.getAuth(req);
        var createMetadataReq = {
            spreadsheetId: spreadsheetID,
            auth: oauth2Client,
            resource: {
                requests: [
                    {

                        "deleteDeveloperMetadata": {
                            "dataFilter": {
                                "developerMetadataLookup": {
                                    "metadataKey": "lock_key",
                                    "metadataValue": ID,
                                    "locationType": "ROW"
                                }
                            }
                        }
                    },
                    {

                        "createDeveloperMetadata": {
                            "developerMetadata": {
                                "location": {
                                    "dimensionRange": {
                                        "sheetId": sheetID,
                                        "dimension": "ROWS",
                                        "startIndex": rowid,
                                        "endIndex": rowid + 1
                                    }
                                },
                                "metadataKey": "lock_key",
                                "metadataValue": ID,
                                "visibility": "DOCUMENT"
                            }
                        }
                    }
                ]
            }

        };

        sheets.spreadsheets.batchUpdate(createMetadataReq, function (err, result) {
            if (err) {
                console.log(err);
                res.send({ error: err });
                return;
            }

            var getReq = {
                spreadsheetId: spreadsheetID,
                auth: oauth2Client,
                resource: {
                    "dataFilters": [{
                        "developerMetadataLookup": {
                            "metadataKey": "lock_key",
                            "metadataValue": ID,
                            "locationType": "ROW",
                            "visibility": "DOCUMENT"
                        }
                    }]
                }
            };

            sheets.spreadsheets.values.batchGetByDataFilter(getReq, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send({ error: err });
                    return;
                }

                if (result.valueRanges.length !== 1) {
                    res.send({ error: "ERROR_METADATA_CREATION" });
                    return;
                }

                var markedRowID = result.valueRanges[0].valueRange.values[0][1];
                if (markedRowID !== ID) {
                    res.send({ error: "ERROR_METADATA_CREATION" });
                    return;
                }

                var cleanReq = {
                    spreadsheetId: spreadsheetID,
                    auth: oauth2Client,
                    resource: {
                        "dataFilters": [{
                            "developerMetadataLookup": {
                                "metadataKey": "lock_key",
                                "metadataValue": ID,
                                "locationType": "ROW",
                                "visibility": "DOCUMENT"
                            }
                        }]
                    }
                };

                sheets.spreadsheets.values.batchClearByDataFilter(cleanReq, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send({ error: err });
                        return;
                    }

                    if (callback)
                        callback();
                    else
                        res.send({ error: null });

                }
                );
            }
            );

        });
    }

    static append(req: Request, res: Response, spreadsheetID: String, sheetName: String, sheetID: String, values) {
        var spreadsheetReqDefinition = null;

        var data = fs.readFileSync(path.join(__dirname, '../json/base-spreadsheet.json'), 'utf8');
        spreadsheetReqDefinition = JSON.parse(data);

        var oauth2Client = SheetRoute.getAuth(req);

        var request = {
            spreadsheetId: spreadsheetID,
            range: sheetName + '!1:1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'OVERWRITE',
            auth: oauth2Client,
            resource: {
                "majorDimension": "ROWS",
                "values": [values]
            }
        };

        sheets.spreadsheets.values.append(request, function (err, result) {
            if (err) {
                console.log(err);
                res.send({ error: err });
                return false;
            }

            var rowIndex = parseInt(result.updates.updatedRange.split('!')[1].split(':')[1].replace(/[A-Z]/g, ''));
            if (rowIndex < 0) {
                res.send({ error: "ERROR_APPEND" });
                return false;
            }

            res.send({ error: null });
            return true;
        });

    }



    static writeConfigFile(req: Request,
        fileoperationtype: eFileOperationType,
        fileId: string,
        folderId: string,
        data: string): Promise<string> {

        var projId = Config.get<string>("googleConfig.clientID");
        projId = projId.split('.')[0];

        var googleApi = require('googleapis');
        var googleAuth = require('google-auth-library');
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2();
        oauth2Client.credentials = {
            access_token: req.session['google_access_token']
        };
        const drive = googleApi.drive({ version: 'v3' });

        return new Promise<string>((cb, err_cb) => {
            let fileName = fileoperationtype.toString();
            if (fileoperationtype === eFileOperationType.moveToFolder) {
                drive.files.get(
                    {
                        fileId: fileId,
                        fields: 'parents',
                        auth: oauth2Client
                    }
                    , function (err, fileinfo) {

                        if (err) {
                            err_cb(err);
                        }

                        drive.files.update(
                            {
                                fileId: fileId,
                                auth: oauth2Client,
                                removeParents: fileinfo['parents'][0],
                                addParents: folderId
                            }
                            , function (err, result) {
                                if (!err) {
                                    cb(data);
                                } else {
                                    err_cb(err);
                                }
                            });
                    });
            }
            else if (fileId) {
                drive.files.update(
                    {
                        fileId: fileId,
                        media:
                        {
                            body: data,
                            mimeType: 'application/json'

                        },
                        auth: oauth2Client
                    }
                    , function (err, fileinfo) {
                        if (!err) {
                            cb(fileinfo.id);
                        } else {
                            err_cb(err);
                        }
                    });
            }
            else {
                drive.files.create(
                    {
                        resource: {
                            name: fileName + '_' + projId,
                            parents: fileoperationtype === eFileOperationType.folder ? [] : [folderId],
                            mimeType: fileoperationtype === eFileOperationType.folder ? "application/vnd.google-apps.folder" : 'application/json',
                            appProperties: {
                                additionalID: projId
                            }
                        },
                        media:
                        {
                            body: data,
                            mimeType: 'application/json'

                        },
                        auth: oauth2Client
                    }
                    , function (err, fileinfo) {
                        if (!err) {
                            cb(fileinfo.id);
                        } else {
                            err_cb(err);
                        }
                    });
            }

        });

    }

    static getConfigFile<T>(token: string, fileId: string, filetype: eFileOperationType): Promise<T> {
        var projId = Config.get<string>("googleConfig.clientID");
        projId = projId.split('.')[0];

        var googleApi = require('googleapis');
        var googleAuth = require('google-auth-library');
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2();
        oauth2Client.credentials = {
            access_token: token
        };
        const drive = googleApi.drive({ version: 'v3' });
        let fileName = filetype.toString();
        return new Promise<T>((cb, err_cb) => {
            if (fileId) {
                drive.files.get(
                    {
                        fileId: fileId,
                        alt: 'media',
                        auth: oauth2Client
                    }
                    , function (err, data) {
                        if (err) {
                            err_cb(err);
                        }
                        else if (data) {
                            cb(<T>data);
                        }
                    });
            }
            else {
                drive.files.list(
                    {
                        q: 'name = "' + fileName + '_' + projId +
                        '" and trashed=false and appProperties has { key="additionalID" and value="' + projId + '" }',
                        auth: oauth2Client
                    }
                    , function (err, data) {
                        if (err) {
                            err_cb(err);
                        }
                        else if (data && data.files.length > 0) {
                            var file = data.files[0];
                            drive.files.get(
                                {
                                    fileId: file.id,
                                    alt: 'media',
                                    auth: oauth2Client
                                }
                                , function (err, data) {
                                    if (data) {
                                        let obj = <T>data;
                                        obj['fileId'] = file.id;
                                        cb(obj);
                                    }
                                    else {
                                        err_cb(err);
                                    }
                                });
                        }
                        else{
                            cb(null);
                        }

                    });
            }
        });

    }
}