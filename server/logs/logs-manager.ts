import { BaseEntity } from './../models/base-entity';
import { IEntitiesPackage } from './../common/select-obj';
import { SheetsCrudOperations } from './../sheets/sheets_crud_operations';
import { SheetsCommonOperations } from './../sheets/sheets_common_operations';
import * as path from 'path';
import * as fs from 'fs';
import { eEntityAction } from '../models/base-entity';
import { SheetsMgr } from '../common/sheets-mgr';
let google = require('googleapis');
import * as uuidv1 from 'uuid/v1';

export class LogsManager {

    private constructor() {
        let data = fs.readFileSync(path.join(__dirname, '../json/logs.json'), 'utf8');
        this.logDef = JSON.parse(data);
    }

    private logDef;
    private static _uniqueInstance: LogsManager;

    public static get uniqueInstance(): LogsManager {
        if (LogsManager._uniqueInstance === undefined) {
            LogsManager._uniqueInstance = new LogsManager();
        }
        return LogsManager._uniqueInstance;
    }

    public write(userId: string, domainId: string, descr: string) {
        let logDef = this.logDef;
        if (logDef.isActive === false)
            return

        let jwtClient = new google.auth.JWT(
            this.logDef.account,
            null,
            this.logDef.private_key,
            this.logDef.scope);

        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                return;
            } else {

                SheetsMgr.uniqueInstance.get(tokens['access_token'], domainId)
                    .then(spreadsheetsSet => {

                        if (!spreadsheetsSet) {
                            return;
                        }
                        let spreadSheet = spreadsheetsSet.spreadsheets.find(s => s.spreadsheetName === logDef.spreadsheetName);
                        if (spreadSheet === null)
                            return;

                        let sheet = spreadSheet.sheets.find(s => s.sheetName === logDef.sheetName);
                        if (sheet === null)
                            return;

                        let log_date = BaseEntity.toDateStructFormat(new Date(Date.now()));
                        let pack: IEntitiesPackage = {
                            spreadsheetID: spreadSheet.spreadsheetID,
                            spreadsheetName: spreadSheet.spreadsheetName,
                            entityPackages: [
                                {
                                    sheetName: sheet.sheetName,
                                    sheetID: sheet.sheetID,
                                    ID: null,
                                    rowid: null,
                                    selectEntity: null,
                                    values: [uuidv1(), log_date, userId, descr],
                                    action: eEntityAction.Create
                                },
                            ],
                            action: eEntityAction.Create,
                        };
                        SheetsCrudOperations.append(tokens['access_token'], pack);

                    })
                    .catch(err => {
                        console.log(err);
                        return;
                    });
            }

        });

    }


}