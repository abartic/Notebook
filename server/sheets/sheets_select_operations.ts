import { BaseEntity } from "../models/base-entity";
import { ModelFactory } from "../models/modelFactory";
import { SheetsMgr } from "../common/sheets-mgr";
import { ISelectObj } from "../common/select-obj";

export class SheetsSelectOperations {

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





    static getCompany(access_token, domainId: string) {
        let spreadsheetName = "settings",
            sheetName = "companies",
            entityName = "Company",
            select = "select * limit 1",
            addSchema = false;

        return SheetsSelectOperations.selectEntity(access_token, domainId, spreadsheetName, sheetName, entityName);
    }

    static selectEntity(accessToken: string, domainId: string, spreadsheetName: string, sheetName: string, entityName: string, select?: string, addSchema?: boolean, scalar?: boolean) {
        if (!select)
            select = "select * limit 1";
        if (!addSchema)
            addSchema = false;

        let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
        return SheetsMgr.uniqueInstance.get(accessToken, domainId)
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
                    access_token: accessToken
                };

                var jsonpClient = require('jsonp-client');
                var url = "https://docs.google.com/spreadsheets/d/" + p_spreadsheet.spreadsheetID +
                    "/gviz/tq?tqx=responseHandler:handleTqResponse" +
                    "&sheet=" + sheetName +
                    "&headers=1" +
                    "&tq=" + encodeURI(select) +
                    "&access_token=" + accessToken


                return new Promise((cb, cerr) => {
                    jsonpClient(url,
                        function (err, data) {
                            if (err) {
                                cerr({ error: err });
                            }
                            else if (data.status === 'error') {
                                cerr({ error: data.errors });
                            }
                            else {
                                if (scalar === true) {
                                    let result = { scalar: 0 };
                                    for (const row of data.table.rows) {
                                        var ent = {};
                                        result['scalar'] = row.c[0].v;

                                        break;
                                    }
                                    return cb(result);
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
                                            } else if (row.c[i] === null && ent['fetchAll'] === true)
                                            {
                                                ent[col.label] = undefined;
                                            }
                                            i += 1;
                                        }
                                        ent.prepareForJsonSerialization();
                                        entities.push(ent)
                                    }
                                    let result = {};
                                    result['rows'] = entities;
                                    if (addSchema === true)
                                        result['schema'] = schema;
                                    return cb(result);
                                }
                            }
                        });
                });

            }).catch(err => {
                if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                    return Promise.reject({ error: { code: 401 } });
                else
                    return Promise.reject({error : err});
            });
    }
}