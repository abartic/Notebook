import { IEntitiesPackage } from "../common/select-obj";
import { SheetsCommonOperations } from "./sheets_common_operations";
import { KeyedCollection } from "../utils/dictionary";
import { eEntityAction, BaseEntity } from "../models/base-entity";
import * as fs from 'fs';
import * as path from 'path';
import { eFieldDataType } from "../common/enums";
let googleApi = require('googleapis');
let sheets = googleApi.sheets('v4');

export class SheetsCrudOperations {
    static update(accessToken: string, entitiesPackage: IEntitiesPackage) {

        let spreadsheetName = entitiesPackage.spreadsheetName;
        let spreadsheetID = entitiesPackage.spreadsheetID;
        let entitiesPackagesAction = entitiesPackage.action;

        let oauth2Client = SheetsCommonOperations.createAuth(accessToken);

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
        let needCreationPkgs = entitiesPackage.entityPackages.filter(p => p.action === eEntityAction.Create)
        let d_sheetsDef = new KeyedCollection<ISheet>();
        if (needCreationPkgs) {
            let data = fs.readFileSync(path.join(__dirname, ('../json/' + spreadsheetName + '.json')), 'utf8');
            let spreadsheetDefinition = JSON.parse(data);

            for (let sheetDef of spreadsheetDefinition['sheets']) {
                if (needCreationPkgs.find(p => p.sheetName === sheetDef.sheetName))
                    d_sheetsDef.Add(sheetDef.sheetName, sheetDef);
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
                if (values[i] !== null && values[i] !== undefined && SheetsCommonOperations.isDate(values[i])) {
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
                let temp = SheetsCrudOperations.createAppendCellsReq(d_sheetsDef.Item(entityPackage.sheetName), entityPackage);
                deleteMetadataAndAppendsReq.resource.requests.push(temp);
            }
        }

        return SheetsCommonOperations.setMetadataWithRetry(accessToken, entitiesPackage)
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
                return { error: 'Cannot save. Lock of record(s) failed! Please retry!' };
            });

    }

    static clean(accessToken: string, entitiesPackage: IEntitiesPackage) {

        let spreadsheetID = entitiesPackage.spreadsheetID;
        let spreadsheetName = entitiesPackage.spreadsheetName;

        let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
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

        return SheetsCommonOperations.setMetadataWithRetry(accessToken, entitiesPackage)
            .then(resp => {
                let results = [];

                if (resp === false) {
                    throw false;
                }

                return new Promise((cb) => {
                    sheets.spreadsheets.values.batchClearByDataFilter(cleanDataFilterReq, function (err, result) {
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
            .catch((r) => {
                return { error: 'Cannot save. Lock of record(s) failed! Please retry! ('  + r + ')'};
            });
    }

    static append(access_token: string, entitiesPackage: IEntitiesPackage) {

        let spreadsheetName = entitiesPackage.spreadsheetName;
        let spreadsheetID = entitiesPackage.spreadsheetID;
        for (let entityPackage of entitiesPackage.entityPackages) {
            entityPackage.values.splice(0, 0, "=ROW()");
            for (let i = 0; i < entityPackage.values.length; i++) {
                if (entityPackage.values[i] !== null && entityPackage.values[i] !== undefined && SheetsCommonOperations.isDate(entityPackage.values[i])) {
                    entityPackage.values[i] = BaseEntity.toGoogleSheetsAPIDate(entityPackage.values[i]);
                }
            }
        }

        //check which sheets will be appended
        let entitiesSheets = [];
        entitiesPackage.entityPackages
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

        var oauth2Client = SheetsCommonOperations.createAuth(access_token);
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


            let temp = SheetsCrudOperations.createAppendCellsReq(sheetDef, entityPackage);
            appendCellReqs = appendCellReqs.concat(temp);
        }

        for (let entitySheet of entitiesSheets) {
            appendCellReqs.push({
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
                    else {
                        if (!result.replies || result.replies.length === 0) {
                            cb({ error: "ERROR_APPEND" });

                        }

                        cb({ error: null });
                    }
                });

        });


    }

    static createAppendCellsReq(sheetDef, entityPackage) {
        let appendCellReqs = [];

        let sheetID, values;
        sheetID = entityPackage.sheetID;
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
            if (sheetDef.fields_types && sheetDef.fields_types[ti] === eFieldDataType.Integer) {
                rowData.values.push({
                    "userEnteredValue": {
                        "numberValue": values[ti + 2]
                    },
                    "userEnteredFormat": {
                        "numberFormat": {
                            "type": "NUMBER",
                            "pattern": "#,##0"
                        }
                    }
                });
            }
            else if (sheetDef.fields_types && sheetDef.fields_types[ti] === eFieldDataType.Numeric) {
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
            } else if (sheetDef.fields_types && sheetDef.fields_types[ti] === eFieldDataType.Boolean) {
                rowData.values.push({
                    "userEnteredValue": {
                        "boolValue": values[ti + 2] === true ? "TRUE" : "FALSE"
                    },
                    "userEnteredFormat": {
                        "numberFormat": {
                            "type": "NUMBER",
                            "pattern": "#,##0.00"
                        }
                    }, "dataValidation": {
                        "condition": {
                            "type": "BOOLEAN"
                        }
                    }
                });
            }
            else if (sheetDef.fields_types && sheetDef.fields_types[ti] === eFieldDataType.Date) {
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
                "fields": "userEnteredValue,userEnteredFormat,dataValidation"
            }
        });

        return appendCellReqs;
    }

}