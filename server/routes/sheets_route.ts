import { ModelFactory } from './../models/modelFactory';



import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import * as request from 'request-promise';
import * as fs from 'fs';
import * as path from 'path';
var googleApi = require('googleapis');
var sheets = googleApi.sheets('v4');



export class SheetRoute extends BaseRoute {

    constructor() {
        super();
    }

    // tslint:disable-next-line:member-ordering
    public static create(router: Router) {

        router.post('/sheetdata/create-spreadsheet',
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetNames } = req.body;

                var googleApi = require('googleapis');
                var googleAuth = require('google-auth-library');
                var sheets = googleApi.sheets('v4');

                var auth = new googleAuth();
                var oauth2Client = new auth.OAuth2();
                oauth2Client.credentials = {
                    access_token: req.session['google_access_token']
                };

                let accountSpreadsheets: Array<Spreadsheet> = new Array<Spreadsheet>();

                let spreadsheetReqDefinition = null;
                let data = fs.readFileSync(path.join(__dirname, '../json/base-spreadsheet.json'), 'utf8');
                spreadsheetReqDefinition = JSON.parse(data);

                let spreadsheetCount = spreadsheetNames.length;
                let spreadsheetIndex = 1;
                for (let spreadsheetName of spreadsheetNames) {


                    data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
                    let spreadsheetDefinition = JSON.parse(data);

                    let spreadsheetReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.spreadsheet));
                    spreadsheetReq.properties.title = spreadsheetDefinition.name;


                    for (let sheet of spreadsheetDefinition.sheets) {
                        let sheetReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.sheet));
                        sheetReq.properties.title = sheet.name;
                        spreadsheetReq.sheets.push(sheetReq);

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

                    sheets.spreadsheets.create({
                        resource: spreadsheetReq,
                        auth: oauth2Client
                    },
                        function (err, result) {
                            if (err) {
                                console.log(err);
                                res.send({ error: err });
                                return;
                            }
                            const spreadsheet = result;

                            let accountSpreadsheet = <Spreadsheet>{};
                            accountSpreadsheets.push(accountSpreadsheet);
                            accountSpreadsheet.spreadsheetName = spreadsheetDefinition.name;
                            accountSpreadsheet.spreadsheetID = spreadsheet.spreadsheetId;
                            accountSpreadsheet.sheets = new Array<Sheet>();

                            for (const sheet of spreadsheet.sheets) {

                                let accountSheet = <Sheet>{};
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

                                var sheetDef = spreadsheetDefinition.sheets.find(function (item) { return item.name === sheet.properties.title; });
                                let fieldIndex = 0;

                                for (const field of sheetDef.fields) {

                                    const metadataFieldReq = JSON.parse(JSON.stringify(spreadsheetReqDefinition.meta_data_column));
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.startIndex = fieldIndex;
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.endIndex = ++fieldIndex;
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.location.dimensionRange.sheetId = sheet.properties.sheetId;
                                    metadataFieldReq.createDeveloperMetadata.developerMetadata.metadataValue = sheetDef.name + '.' + field;
                                    requests.push(metadataFieldReq);
                                }

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
                                            console.log(err);
                                            res.send({ error: err });
                                            return;
                                        }

                                        spreadsheetIndex++;
                                        if (spreadsheetIndex === spreadsheetCount) {
                                            let data = fs.readFileSync(path.join(__dirname, ('../json/accounts.json')), 'utf8');
                                            let accounts = <Array<Account>>(JSON.parse(data));

                                            for (let account of accounts) {
                                                if (account.accountName === req.session['userId']) {
                                                    account.spreadsheets = accountSpreadsheets;

                                                    fs.writeFileSync(
                                                        path.join(__dirname, ('../json/accounts.json')),
                                                        JSON.stringify(accounts),
                                                        'utf8');
                                                    break;
                                                }

                                            }
                                            res.send({ error: null });
                                        }
                                    });

                            }
                        });
                }
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
                const { spreadsheetID, sheetName, sheetID, rowID, rowIndex } = req.body;

                SheetRoute.clean(req, res, spreadsheetID, sheetName, sheetID, rowID, rowIndex, null);
            });


        router.post('/sheetdata/update',
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetID, sheetName, sheetID, values } = req.body;

                var rowIndex = values[0] - 1;
                values[0] = "=ROW()";
                var rowID = values[1];
                SheetRoute.clean(req, res, spreadsheetID, sheetName, sheetID, rowID, rowIndex, function () {
                    SheetRoute.append(req, res, spreadsheetID, sheetName, sheetID, values);
                });

            });

        router.post('/sheetdata/select',
            (req: Request, res: Response, next: NextFunction) => {

                const { spreadsheetName, sheetName, entityName, select } = req.body;

                let data = fs.readFileSync(path.join(__dirname, ('../json/accounts.json')), 'utf8');
                let accounts : Account[] = <Account[]>(JSON.parse(data));
                let account : Account = accounts.find(function (a, index, array) { return a.accountName === req.session['userId'];});
                let sheet : Sheet  = undefined;
                let spreadsheet : Spreadsheet= undefined;
                
                if (account !== undefined) {
                    spreadsheet = account.spreadsheets.find(s => s.spreadsheetName === spreadsheetName);
                    if (spreadsheet !== undefined) {
                        sheet = spreadsheet.sheets.find(s => s.sheetName === sheetName);
                    }
                }

                if (sheet === undefined) {
                    res.send({ error: 'account missing' });
                    return;
                }

                var googleApi = require('googleapis');
                var googleAuth = require('google-auth-library');
                var auth = new googleAuth();
                var oauth2Client = new auth.OAuth2();
                oauth2Client.credentials = {
                    access_token: req.session['google_access_token']
                };

                var jsonpClient = require('jsonp-client');
                var url = "https://docs.google.com/spreadsheets/d/" + spreadsheet.spreadsheetID +
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
                        else {
                            var entities = [];
                            for (const row of data.table.rows) {
                                var ent = ModelFactory.uniqueInstance.create(entityName);
                                var i = 0;
                                for (const col of data.table.cols) {
                                    ent[col.label] = row.c[i++].v;
                                }
                                entities.push(ent)
                            }
                            res.json(entities);
                        }
                    });
            });

        
            var parse = function (data) {
            var column_length = data.table.cols.length;
            if (!column_length || !data.table.rows.length) {
                return false;
            }
            var columns = [],
                result = [],
                row_length,
                value;
            for (var column_idx in data.table.cols) {
                columns.push(data.table.cols[column_idx].label);
            }
            for (var rows_idx in data.table.rows) {
                row_length = data.table.rows[rows_idx]['c'].length;
                if (column_length != row_length) {
                    // Houston, we have a problem!
                    return false;
                }
                for (var row_idx in data.table.rows[rows_idx]['c']) {
                    if (!result[rows_idx]) {
                        result[rows_idx] = {};
                    }
                    value = !!data.table.rows[rows_idx]['c'][row_idx].v ? data.table.rows[rows_idx]['c'][row_idx].v : null;
                    result[rows_idx][columns[row_idx]] = value;
                }
            }
            return result;
        };
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

    static clean(req: Request, res: Response, spreadsheetID, sheetName, sheetID, rowID, rowIndex, callback) {

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
                                    "metadataValue": rowID,
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
                                        "startIndex": rowIndex,
                                        "endIndex": rowIndex + 1
                                    }
                                },
                                "metadataKey": "lock_key",
                                "metadataValue": rowID,
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
                            "metadataValue": rowID,
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
                if (markedRowID !== rowID) {
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
                                "metadataValue": rowID,
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

        var data = fs.readFileSync(path.join(__dirname, '../base-spreadsheet.json'), 'utf8');
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
}