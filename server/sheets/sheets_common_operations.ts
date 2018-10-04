import { IEntitiesPackage, ISelectObj } from "../common/select-obj";
import { eEntityAction } from "../models/base-entity";
import { SheetsSelectOperations } from "./sheets_select_operations";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";


let googleApi = require('googleapis');
let sheets = googleApi.sheets('v4');



export enum eFileOperationType {
    folder = "f",
    moveToFolder = "mf",
    accounts = "accounts",
    sheets = "sheets",
    read = "read"
}

export class SheetsCommonOperations {

    static isDate(value: NgbDateStruct): value is NgbDateStruct {
        return (<NgbDateStruct>value).year !== undefined;
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

    static setMetadataWithRetry(accessToken: string, entitiesPackage: IEntitiesPackage) {
        return new Promise((result: (boolean) => void) => {
            let retryCount = 0;
            let functionToRetry = () => {
                SheetsCommonOperations.setMetadata(accessToken,
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
        let oauth2Client = SheetsCommonOperations.createAuth(accessToken);
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

                callsSelectID.push(SheetsSelectOperations.selectID(accessToken,
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
                let index = 0;
                for (let entityID of entityIDs) {
                    let markedRowID = null;
                    if (r['valueRanges'][index].valueRange.values)
                        markedRowID = r['valueRanges'][index].valueRange.values[0][1];
                    let ID = r['valueRanges'][index].dataFilters[0].developerMetadataLookup.metadataValue;
                    if (markedRowID !== ID) {
                        console.log("ERROR_METADATA_CREATION");
                        entitiesPackage.entityPackages[index]['error'] = true;
                        error = true;
                    }
                    index++;
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
}