import { IEntityPackage } from './../common/select-obj';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BaseEntity, eEntityAction } from './../models/base-entity';
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
import { DriverRoute } from './driver_route';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ModelInfos } from '../models/modelProperties';
import { ISelectObj, IEntitiesPackage } from '../common/select-obj';
import 'rxjs/add/observable/forkJoin';

var googleApi = require('googleapis');
var sheets = googleApi.sheets('v4');
const jsreport = require('jsreport-core')({
    templatingEngines: { strategy: 'in-process' },
    tempDirectory: path.join(__dirname, 'jsReportsTempFolder')
})




export enum eFileOperationType {
    folder = "f",
    moveToFolder = "mf",
    accounts = "accounts",
    sheets = "sheets",
}

function isDate(value: NgbDateStruct): value is NgbDateStruct {
    return (<NgbDateStruct>value).year !== undefined;
}

export class SheetRoute extends BaseRoute {

    constructor() {
        super();

    }


    public static create(router: Router) {

        jsreport.use(require('jsreport-handlebars')())
        jsreport.use(require('jsreport-jsrender')());
        jsreport.use(require('jsreport-phantom-pdf')({ strategy: 'phantom-server' }))
        jsreport.use(require('jsreport-assets')({ 
            searchOnDiskIfNotFoundInStore: true, 
            allowedFiles: '**/*.*',
            publicAccessEnabled: true,
            rootUrlForLinks: Config.get<string>("reportsConfig.rootURL"),
        }))
        jsreport.init().then(() => console.log('js reports initiated.'));

        router.post('/sheetdata/delete-metadata',
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
                            res.send({ error: 'Errors. Retry!' + results });
                        }
                        else {
                            res.send({});
                        }
                    })
            });

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
                                fields_rowReq.addProtectedRange.protectedRange.editors.users.push(req.session['userId']);

                                // var sort_fields_rowReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.sort_fields_row));
                                // sort_fields_rowReq.sortRange.range.sheetId = sheet.properties.sheetId;

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

                                // for (const field of sheetDef.fields) {

                                //     const metadataFieldReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.meta_data_column));
                                //     metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.startIndex = fieldIndex;
                                //     metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.endIndex = ++fieldIndex;
                                //     metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.sheetId = sheet.properties.sheetId;
                                //     metadataFieldReq.createDeveloperMetadata.developerMetadata.metadataValue = sheetDef.sheetName + '.' + field;
                                //     requests.push(metadataFieldReq);
                                // }


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
                        DriverRoute.writeConfigFile(req, eFileOperationType.folder, null, null, null)
                            .then(fileId => {
                                folderId = fileId;
                                // accountsSet.accounts.push({
                                //     accountName: req.session['userId'],
                                //     role: "proj-admin",
                                //     accountDescr: "google-account",
                                //     enrollmentDate: Date.now()
                                // });

                                return DriverRoute.writeConfigFile(req, eFileOperationType.accounts, null, folderId, JSON.stringify(accountsSet));
                            })
                            .then(accountsFileId => {
                                let spreadsheetsSet: ISpreadsheetsSet = {
                                    accountsFileId: accountsFileId,
                                    spreadsheets: accountSpreadsheets
                                };

                                calls_file = [DriverRoute.writeConfigFile(req, eFileOperationType.sheets, null, folderId, JSON.stringify(spreadsheetsSet))];

                                for (let ash of accountSpreadsheets)
                                    calls_file.push(DriverRoute.writeConfigFile(req, eFileOperationType.moveToFolder, ash.spreadsheetID, folderId, null));

                                Promise.all(calls_file);

                            })
                            .then(() => {
                                res.send({ error: null });
                            });
                    })
                    .catch(r => {
                        if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send(r);
                    })
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

                        calls.push(DriverRoute.writeConfigFile(req, eFileOperationType.accounts, accountsFileId, null, JSON.stringify(accountsSet)));
                        return Promise.all(calls);
                    })
                    .then(r => { return res.send({ error: null }); })
                    .catch(r => {
                        if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send(r);
                    });
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
                        if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send(r);
                    });
            });


        router.post('/sheetdata/create',
            (req: Request, res: Response, next: NextFunction) => {

                let entitiesPackage = <IEntitiesPackage>req.body;
                let accessToken = req.session['google_access_token'];
                SheetRoute.append(accessToken, entitiesPackage).then(result => {
                    res.send(result);
                });
            });

        router.post('/sheetdata/delete',
            (req: Request, res: Response, next: NextFunction) => {
                let entitiesPackage = <IEntitiesPackage>req.body;
                let accessToken = req.session['google_access_token'];
                SheetRoute.clean(accessToken, entitiesPackage).then(result => {
                    res.send(result);
                });
            });


        router.post('/sheetdata/update',
            (req: Request, res: Response, next: NextFunction) => {
                let entitiesPackage = <IEntitiesPackage>req.body;
                let accessToken = req.session['google_access_token'];
                SheetRoute.update(accessToken, entitiesPackage).then(result => {
                    res.send(result);
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
                                        let ent;
                                        if (entityName)
                                            ent = ModelFactory.uniqueInstance.create(entityName.toLowerCase());
                                        else
                                            ent = {};
                                        var i = 0;
                                        for (const col of data.table.cols) {
                                            if (row.c[i] && row.c[i].v !== undefined) {
                                                if (col.type === 'date' && row.c[i].v !== undefined && row.c[i].v !== null)
                                                    ent[col.label] = BaseEntity.toDateStructFormat(eval('new ' + row.c[i].v));
                                                else
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

                    }).catch(r => {
                        if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send(r);
                    });
            });
        router.post('/sheetdata/validate',
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
                                    let result = null;
                                    if (data.table.cols.length > 0 && data.table.rows.length === 0)
                                        result = data.table.cols[0].label
                                    res.json(result);
                                }
                            });

                    }).catch(r => {
                        if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send(r);
                    });
            });

        router.post('/sheetdata/report',
            (req: Request, res: Response, next: NextFunction) => {

                let entityPackage = <IEntityPackage>req.body;
                let accessToken = req.session['google_access_token'];
                let reportType = entityPackage['reportType']; 
                let content = fs.readFileSync(path.join(__dirname, ('../assets/content/reports/'+ reportType +'/' + reportType + '_template.html')), 'utf8');
                let helpers = fs.readFileSync(path.join(__dirname, ('../assets/content/reports/' + reportType + '/' + reportType + '_script.js')), 'utf8');

                return jsreport.render({
                    template: {
                        content: content,
                        helpers: helpers,    
                        engine: 'handlebars',
                        recipe: 'phantom-pdf'
                    },
                    data: entityPackage.values
                }).then((out) => {
                    res.setHeader('Content-Type', 'application/pdf');
                    out.stream.pipe(res);

                }).catch(r => {
                    if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                        res.send({ error: { code: 401 } });
                    else
                        res.send(r);
                });



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
                        if (r && r.message && r.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send(r);
                    });
            });





    }

 

    static update(accessToken: string, entitiesPackage: IEntitiesPackage) {

        let spreadsheetName = entitiesPackage.spreadsheetName;
        let spreadsheetID = entitiesPackage.spreadsheetID;
        let entitiesPackagesAction = entitiesPackage.action;

        let oauth2Client = SheetRoute.createAuth(accessToken);

        let updateDataFilterReq = {
            spreadsheetId: spreadsheetID,
            auth: oauth2Client,
            resource: {
                "data": [],
                "valueInputOption": "USER_ENTERED"
            }
        };

        let deleteMetadataAndAppendsReq = {
            spreadsheetId: spreadsheetID,
            includeSpreadsheetInResponse: false,
            resource: {
                requests: []
            },
            auth: oauth2Client,
        };

        //find sheeetDef if append is needed
        let needCreationPkg = entitiesPackage.entityPackages.find(p => p.action === eEntityAction.Create)
        let sheetDef = null;
        if (needCreationPkg) {
            let data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
            let spreadsheetDefinition = JSON.parse(data);

            for (sheetDef of spreadsheetDefinition['sheets']) {
                if (sheetDef.sheetName === needCreationPkg.sheetName)
                    break;
            }
        }

        for (let entityPackage of entitiesPackage.entityPackages) {
            let sheetName, sheetID, ID, selectEntity, values;
            sheetName = entityPackage.sheetName;
            sheetID = entityPackage.sheetID;
            ID = entityPackage.ID;
            selectEntity = entityPackage.selectEntity;
            values = entityPackage.values;

            if (entityPackage.action === eEntityAction.Update) {
                values.splice(0, 1, "=ROW()");
            }
            else {
                values.splice(0, 0, "=ROW()");
            }
            let rowid = values[1];

            for (let i = 0; i < values.length; i++) {
                if (values[i] !== null && values[i] !== undefined && isDate(values[i])) {
                    values[i] = BaseEntity.toGoogleSheetsAPIDate(values[i]);
                }
            }

            updateDataFilterReq.resource.data.push(
                {
                    "dataFilter": {
                        "developerMetadataLookup": {
                            "metadataKey": "lock_key",
                            "metadataValue": ID,
                            "locationType": "ROW",
                            "visibility": "DOCUMENT"
                        }
                    },
                    "majorDimension": "ROWS",
                    "values": [values]
                });

            let addNewRow = entityPackage.action === eEntityAction.Create && entitiesPackagesAction === eEntityAction.Update;
            if (addNewRow === false) {
                deleteMetadataAndAppendsReq.resource.requests.push({
                    "deleteDeveloperMetadata": {
                        "dataFilter": {
                            "developerMetadataLookup": {
                                "metadataKey": "lock_key",
                                "metadataValue": ID,
                                "locationType": "ROW",
                                "visibility": "DOCUMENT"
                            }
                        }
                    }
                });
            }
            else {
                //add append request
                let temp = SheetRoute.createAppendCellsReq(sheetDef, entityPackage);
                deleteMetadataAndAppendsReq.resource.requests.push(temp);
            }
        }

        return SheetRoute.setMetadataWithRetry(accessToken, entitiesPackage)
            .then(resp => {
                let results = [];

                if (resp === false) {
                    throw false;
                }

                return new Promise((cb) => {
                    sheets.spreadsheets.values.batchUpdateByDataFilter(updateDataFilterReq, function (err, result) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        cb();
                    });
                })
            })
            .then(() => {
                return new Promise((cb) => {
                    sheets.spreadsheets.batchUpdate(deleteMetadataAndAppendsReq, function (err, result) {
                        if (err) {
                            console.log(err + 'Save partial with success! Re-save! Consider to purge metadata!');
                            cb({ error: 'Save partial with success! Re-save! Consider to purge metadata!' });
                        }
                        else {
                            cb({ error: null });
                        }
                    });
                });
            })
            .catch((err) => {
                return Promise.resolve({ error: 'Cannot save. Lock of record(s) failed! Please retry!' });
            });

    }

    static clean(accessToken: string, entitiesPackage: IEntitiesPackage) {

        let spreadsheetID = entitiesPackage.spreadsheetID;
        let spreadsheetName = entitiesPackage.spreadsheetName;

        let oauth2Client = SheetRoute.createAuth(accessToken);
        let cleanDataFilterReq = {
            spreadsheetId: spreadsheetID,
            auth: oauth2Client,
            resource: {
                "dataFilters": []
            }
        };
        let deleteMetadataReq = {
            spreadsheetId: spreadsheetID,
            includeSpreadsheetInResponse: false,
            resource: {
                requests: []
            },
            auth: oauth2Client,
        };


        let callsSetMetadata = [];
        for (let entityPackage of entitiesPackage.entityPackages) {
            let sheetName, sheetID, ID, selectEntity, values;
            sheetName = entityPackage.sheetName;
            sheetID = entityPackage.sheetID;
            ID = entityPackage.ID;
            selectEntity = entityPackage.selectEntity;
            values = entityPackage.values;

            cleanDataFilterReq.resource.dataFilters.push(
                {
                    "developerMetadataLookup": {
                        "metadataKey": "lock_key",
                        "metadataValue": ID,
                        "locationType": "ROW",
                        "visibility": "DOCUMENT"
                    }
                });
            deleteMetadataReq.resource.requests.push({
                "deleteDeveloperMetadata": {
                    "dataFilter": {
                        "developerMetadataLookup": {
                            "metadataKey": "lock_key",
                            "metadataValue": ID,
                            "locationType": "ROW",
                            "visibility": "DOCUMENT"
                        }
                    }
                }
            });
        }

        return SheetRoute.setMetadataWithRetry(accessToken, entitiesPackage)
            .then(resps => {
                let results = [];
                for (let result of resps) {
                    if (result === false) {
                        throw false;
                    }
                }

                return new Promise((cb) => {
                    sheets.spreadsheets.values.batchCleanByDataFilter(cleanDataFilterReq, function (err, result) {
                        if (err) {
                            console.log(err);
                            throw false;
                        }
                        cb();
                    });
                });
            })
            .then(() => {
                return new Promise((cb) => {
                    sheets.spreadsheets.batchUpdate(deleteMetadataReq, function (err, result) {
                        if (err) {
                            console.log(err + 'Save with success! However, there wase some issues during saving! Purge metadata!');
                            cb({ error: 'Save with success! However, there wase some issues during saving! Purge metadata!' });
                        }
                        else {
                            cb({ error: null });
                        }
                    });

                });
            })
            .catch(() => {
                return { error: 'Cannot save. Lock of record(s) failed! Please retry!' };
            });
    }

    static append(access_token: string, entitiesPackage: IEntitiesPackage) {

        let spreadsheetName = entitiesPackage.spreadsheetName;
        let spreadsheetID = entitiesPackage.spreadsheetID;
        for (let entityPackage of entitiesPackage.entityPackages) {
            entityPackage.values.splice(0, 0, "=ROW()");
            for (let i = 0; i < entityPackage.values.length; i++) {
                if (entityPackage.values[i] !== null && entityPackage.values[i] !== undefined && isDate(entityPackage.values[i])) {
                    entityPackage.values[i] = BaseEntity.toGoogleSheetsAPIDate(entityPackage.values[i]);
                }
            }
        }

        var oauth2Client = SheetRoute.createAuth(access_token);
        let data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
        let spreadsheetDefinition = JSON.parse(data);
        let appendCellReqs = [];

        for (let entityPackage of entitiesPackage.entityPackages) {
            if (entityPackage.action !== eEntityAction.Create)
                continue;

            let sheetDef = null;
            for (sheetDef of spreadsheetDefinition['sheets']) {
                if (sheetDef.sheetName === entityPackage.sheetName)
                    break;
            }
            if (sheetDef === null)
                return Promise.reject({ error: 'Sheets not exist!' });


            let temp = SheetRoute.createAppendCellsReq(sheetDef, entityPackage);
            appendCellReqs.concat(appendCellReqs, temp);
        }

        return new Promise((cb) => {
            sheets.spreadsheets.batchUpdate(
                {
                    spreadsheetId: spreadsheetID,
                    resource: {
                        responseIncludeGridData: false,
                        includeSpreadsheetInResponse: false,
                        requests: appendCellReqs

                    },
                    auth: oauth2Client,
                },
                function (err, result) {
                    if (err) {
                        if (err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            cb({ error: { code: 401 } });
                        else

                            cb({ error: err });
                    }


                    if (!result.replies || result.replies.length === 0) {
                        cb({ error: "ERROR_APPEND" });

                    }

                    cb({ error: null });
                });

        });


    }

    static selectID(accessToken, spreadsheetID, sheetID: string, index: string, ID: string, selectObj: ISelectObj)
        : Promise<[string, number, string, number]> {

        let promise = new Promise((result: ([sheetID, index, ID, rowID]) => void) => {
            const { sheetName, select } = selectObj;

            var jsonpClient = require('jsonp-client');
            var url = "https://docs.google.com/spreadsheets/d/" + spreadsheetID +
                "/gviz/tq?tqx=responseHandler:handleTqResponse" +
                "&sheet=" + sheetName +
                "&headers=1" +
                "&tq=" + encodeURI(select) +
                "&access_token=" + accessToken

            jsonpClient(url,
                function (err, data) {
                    if (err || data.status === 'error' || data.table.rows.length === 0) {
                        return result([sheetID, index, ID, -1]);
                    }
                    else {
                        for (const row of data.table.rows) {
                            return result([sheetID, index, ID, row.c[0].v]);
                        }
                    }
                });
        }
        );
        return promise;

    }

    static setMetadataWithRetry(accessToken: string, entitiesPackage: IEntitiesPackage) {
        return new Promise((result: (boolean) => void) => {
            let retryCount = 0;
            let functionToRetry = () => {
                SheetRoute.setMetadata(accessToken,
                    entitiesPackage)
                    .then(created => {
                        if (created === false) {
                            if (retryCount < 2) {
                                retryCount += 1;
                                return functionToRetry();
                            }
                            return result(false);
                        }
                        else {
                            return result(true);
                        }
                    });
            };
            return functionToRetry();
        });
    }

    static setMetadata(accessToken: string, entitiesPackage: IEntitiesPackage): Promise<boolean> {

        let spreadsheetID = entitiesPackage.spreadsheetID;
        let spreadsheetName = entitiesPackage.spreadsheetName;
        let oauth2Client = SheetRoute.createAuth(accessToken);
        let spreadsheetDefinition = null;

        let entitiesSheets = [];
        entitiesPackage.entityPackages
            .filter(p => p.action === eEntityAction.Create)
            .map(p => {
                let index = entitiesSheets.findIndex(s => s['sheetName'] === p.sheetName)
                if (index >= 0) {
                    entitiesSheets[index]['entities'].push(p);
                }
                else {
                    entitiesSheets.push({
                        'sheetName': p.sheetName,
                        'sheetID': p.sheetID,
                        'entities': [p]
                    })
                }
            });

        var createMetadataReq = {
            spreadsheetId: spreadsheetID,
            auth: oauth2Client,
            resource: {
                requests: []
            }
        };


        let callsSelectID = [];
        let entityIDs = null;
        let callindex = 0;
        for (let index in entitiesPackage.entityPackages) {
            if (entitiesPackage.entityPackages[index]['error'] !== true
                && entitiesPackage.entityPackages[index].action !== eEntityAction.Create) {
                let selectObj: ISelectObj = {
                    spreadsheetName: '',
                    sheetName: entitiesPackage.entityPackages[index].sheetName,
                    entityName: '',
                    select: entitiesPackage.entityPackages[index].selectEntity,
                    addSchema: false
                };

                callsSelectID.push(SheetRoute.selectID(accessToken,
                    spreadsheetID,
                    entitiesPackage.entityPackages[index].sheetID,
                    callindex.toString(),
                    entitiesPackage.entityPackages[index].ID,
                    selectObj));

                callindex += 1;
            }

        }

        return Promise.all<[string, string, string, number]>(callsSelectID)
            .then(eids => {

                entityIDs = eids;
                if (entityIDs.findIndex(rid => rid[3] <= 1) >= 0) {
                    console.log('metadata - invalid row id');
                    throw false;
                }


                for (let entityID of entityIDs) {
                    let sheetID = entityID[0];
                    let ID = entityID[2];
                    let rowID = entityID[3];

                    createMetadataReq.resource.requests.push({

                        "deleteDeveloperMetadata": {
                            "dataFilter": {
                                "developerMetadataLookup": {
                                    "metadataKey": "lock_key",
                                    "metadataValue": ID,
                                    "locationType": "ROW"
                                }
                            }
                        }
                    });
                    createMetadataReq.resource.requests.push({

                        "createDeveloperMetadata": {
                            "developerMetadata": {
                                "location": {
                                    "dimensionRange": {
                                        "sheetId": sheetID,
                                        "dimension": "ROWS",
                                        "startIndex": rowID - 1,
                                        "endIndex": rowID
                                    }
                                },
                                "metadataKey": "lock_key",
                                "metadataValue": ID,
                                "visibility": "DOCUMENT"
                            }
                        }
                    });
                }

                //force reorder after set metadatas
                for (let entitySheet of entitiesSheets) {
                    createMetadataReq.resource.requests.push({
                        "sortRange": {
                            "range": {
                                "sheetId": entitySheet['sheetID'],
                                "startRowIndex": 1,
                            },
                            "sortSpecs": [{
                                "dimensionIndex": 1,
                                "sortOrder": "DESCENDING"
                            }]
                        }
                    });
                }

                return new Promise((cb) => {
                    sheets.spreadsheets.batchUpdate(createMetadataReq, function (err, r) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        cb(r);
                    });
                });
            })
            .then((r) => {

                var dataFilterReq = {
                    spreadsheetId: spreadsheetID,
                    auth: oauth2Client,
                    resource: {
                        "dataFilters": []
                    }
                };

                for (let entityID of entityIDs) {
                    let ID = entityID[2];
                    dataFilterReq.resource.dataFilters.push({
                        "developerMetadataLookup": {
                            "metadataKey": "lock_key",
                            "metadataValue": ID,
                            "locationType": "ROW",
                            "visibility": "DOCUMENT"
                        }
                    });
                }

                return new Promise((cb) => {
                    sheets.spreadsheets.values.batchGetByDataFilter(dataFilterReq, function (err, r) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        cb(r);
                    });
                });
            })
            .then((r) => {
                if (!(r['valueRanges']) || r['valueRanges'].length === 0) {
                    console.log("ERROR_METADATA_CREATION");
                    throw "ERROR_METADATA_CREATION";
                }

                let error = false;
                for (let entityID of entityIDs) {
                    let markedRowID = null;
                    let index = entityID[1];
                    let ID = entityID[2];
                    if (r['valueRanges'][index].valueRange.values)
                        markedRowID = r['valueRanges'][index].valueRange.values[0][1];
                    if (markedRowID !== ID) {
                        console.log("ERROR_METADATA_CREATION");
                        entitiesPackage.entityPackages[index]['error'] = true;
                        error = true;
                    }
                }
                if (error)
                    return Promise.resolve(false);
                else
                    return Promise.resolve(true);
            })
            .catch((err) => {
                return Promise.resolve(false);
            })

    }

    static createAppendCellsReq(sheetDef, entityPackage) {
        let appendCellReqs = [];


        let sheetName, sheetID, ID, selectEntity, values;
        sheetName = entityPackage.sheetName;
        sheetID = entityPackage.sheetID;
        ID = entityPackage.ID;
        selectEntity = entityPackage.selectEntity;
        values = entityPackage.values;

        let rowData = { values: [] };
        rowData.values.push({
            "userEnteredValue": {
                "formulaValue": values[0]
            },
            "userEnteredFormat": {
                "numberFormat": {
                    "type": "TEXT"
                }
            }
        });

        rowData.values.push({
            "userEnteredValue": {
                "stringValue": values[1]
            },
            "userEnteredFormat": {
                "numberFormat": {
                    "type": "TEXT"
                }
            }
        });
        let ti = 0;
        for (const field of sheetDef.fields) {
            if (sheetDef.fields_types && sheetDef.fields_types[ti] === 'i') {
                rowData.values.push({
                    "userEnteredValue": {
                        "stringValue": values[ti + 2]
                    },
                    "userEnteredFormat": {
                        "numberFormat": {
                            "type": "NUMBER",
                            "pattern": "#,##0"
                        }
                    }
                });
            }
            else if (sheetDef.fields_types && sheetDef.fields_types[ti] === 'n') {
                rowData.values.push({
                    "userEnteredValue": {
                        "numberValue": values[ti + 2]
                    },
                    "userEnteredFormat": {
                        "numberFormat": {
                            "type": "NUMBER",
                            "pattern": "#,##0.00"
                        }
                    }
                });
            }
            else if (sheetDef.fields_types && sheetDef.fields_types[ti] === 'd') {
                rowData.values.push({
                    "userEnteredValue": {
                        "numberValue": values[ti + 2]
                    },
                    "userEnteredFormat": {
                        "numberFormat": {
                            "type": "DATE",
                            "pattern": "dd/MM/yyyy"
                        }
                    }
                });
            }
            else {
                rowData.values.push({
                    "userEnteredValue": {
                        "stringValue": values[ti + 2]
                    },
                    "userEnteredFormat": {
                        "numberFormat": {
                            "type": "TEXT"
                        }
                    }
                });
            }
            ti += 1;
        }


        appendCellReqs.push({
            "appendCells": {
                "sheetId": sheetID,
                "rows": [

                    rowData
                ],
                "fields": "userEnteredValue,userEnteredFormat"
            }
        });

        return appendCellReqs;
    }

    static createAuth(access_token) {

        var googleAuth = require('google-auth-library');
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2();
        oauth2Client.credentials = {
            access_token: access_token
        };

        return oauth2Client;
    }

}