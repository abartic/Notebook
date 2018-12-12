import { DriveOperations } from './../drive/drive_operations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import * as request from 'request-promise';
import acl = require('acl');
import * as path from 'path';
import * as Config from "config";
import * as fs from 'fs';
import { AppAcl } from '../acl/app-acl';
import { SheetsMgr } from '../common/sheets-mgr';
import { IEntitiesPackage, ISelectObj, IEntityPackage } from '../common/select-obj';

import { SheetsCrudOperations } from '../sheets/sheets_crud_operations';
import { SheetsSelectOperations } from '../sheets/sheets_select_operations';
import { SheetsManagementOperations } from '../sheets/sheets_management_operations';
import { Company } from '../models/company';

import { eFileOperationType } from '../sheets/sheets_common_operations';
import { LogsManager } from '../logs/logs-manager';


var googleApi = require('googleapis');
var sheets = googleApi.sheets('v4');
const jsreport = require('jsreport-core')({
    templatingEngines: { strategy: 'in-process' },
    //tempDirectory: path.join(__dirname, 'jsReportsTempFolder')
})



export class SheetRoute extends BaseRoute {

    constructor() {
        super();

    }

    public static create(router: Router, csrfProtection: RequestHandler) {

        console.log(path.join(__dirname, 'jsReportsTempFolder'))
        jsreport.use(require('jsreport-handlebars')())
        jsreport.use(require('jsreport-jsrender')());
        jsreport.use(require('jsreport-phantom-pdf')({ strategy: 'phantom-server' }))
        jsreport.use(require('jsreport-assets')({
            searchOnDiskIfNotFoundInStore: true,
            allowedFiles: '**/*.*',
            publicAccessEnabled: true,
            rootUrlForLinks: Config.get<string>("reportsConfig.rootURL"),
        }))
        jsreport.init()
            .then(() => console.log('js reports initiated.'))
            .catch(err => {
                //LogsManager.uniqueInstance.write('', '', JSON.stringify(err));
                console.log('js reports NOT initiated.')
                console.log(err);
            });

        router.post('/sheetdata/delete-metadata',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetNames } = req.body;
                let accessToken = req.session['google_access_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                SheetsManagementOperations.deleteMetadata(accessToken, domainId, spreadsheetNames)
                    .then(result => {
                        res.send(result);
                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    })

            });

        router.post('/sheetdata/create-spreadsheet',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {
                const { spreadsheetNames } = req.body;
                let accessToken = req.session['google_access_token'];
                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                SheetsManagementOperations.createSpreadsheet(accessToken, domainId, userId, spreadsheetNames)
                    .then(result => {
                        res.send(result);
                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    })

            });

        router.post('/sheetdata/enrolle-user-spreadsheet',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {

                const { user } = req.body;
                let accessToken = req.session['google_access_token'];
                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                SheetsManagementOperations.enrolleUserSpreadsheet(accessToken, domainId, user)
                    .then(result => {
                        res.send(result);
                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    })
            });
        router.post('/sheetdata/disenrolle-user-spreadsheet',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {

                const { user } = req.body;
                let accessToken = req.session['google_access_token'];
                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                SheetsManagementOperations.disenrolleUserSpreadsheet(accessToken, domainId, user)
                    .then(result => {
                        res.send(result);
                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    })
            });

        router.post('/sheetdata/spreadsheet-info',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let accessToken = req.session['google_access_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                const { spreadsheetName, sheetName, entityName } = req.body;

                SheetsManagementOperations.getSpreadsheetInfo(accessToken, domainId, spreadsheetName, sheetName, entityName).then(result => {
                    res.send(result);
                }).catch(err => {
                    LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                    res.send({ error: err });
                })
            });


        router.post('/sheetdata/validate',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let token = req.session['google_access_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                const { spreadsheetName, sheetName, entityName, select, addSchema, checkUnique } = req.body as ISelectObj;

                let p_spreadsheets = undefined, p_spreadsheet = undefined, p_sheet = undefined;
                SheetsMgr.uniqueInstance.get(token, domainId)
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
                                    if (checkUnique === true) {
                                        if (data.table.cols.length > 0 && data.table.rows.length !== 0)
                                            result = data.table.cols[0].label + ' not unique! '
                                    }
                                    else {
                                        if (data.table.cols.length > 0 && data.table.rows.length === 0)
                                            result = data.table.cols[0].label
                                    }
                                    res.json(result);
                                }
                            });

                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                            res.send({ error: { code: 401 } });
                        else
                            res.send({ error: err });
                    });
            });
        router.post('/sheetdata/create',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {

                let entitiesPackage = <IEntitiesPackage>req.body;
                let accessToken = req.session['google_access_token'];
                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                SheetsCrudOperations.append(accessToken, entitiesPackage)
                    .then(result => {
                        res.send(result);
                    })
                    .catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    });
            });

        router.post('/sheetdata/delete',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let entitiesPackage = <IEntitiesPackage>req.body;
                let accessToken = req.session['google_access_token'];
                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                SheetsCrudOperations.clean(accessToken, entitiesPackage)
                    .then(result => {
                        res.send(result);
                    })
                    .catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    });
            });


        router.post('/sheetdata/update',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let entitiesPackage = <IEntitiesPackage>req.body;
                let accessToken = req.session['google_access_token'];
                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                SheetsCrudOperations.update(accessToken, entitiesPackage)
                    .then(result => {
                        res.send(result);
                    })
                    .catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    });

            });


        router.post('/sheetdata/select',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let accessToken = req.session['google_access_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                const { spreadsheetName, sheetName, entityName, select, addSchema } = req.body as ISelectObj;

                SheetsSelectOperations.selectEntity(accessToken, domainId, spreadsheetName, sheetName, entityName, select, addSchema)
                    .then(result => {
                        res.send(result);
                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    });
            });

        router.post('/sheetdata/getscalar',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let accessToken = req.session['google_access_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                const { spreadsheetName, sheetName, entityName, select } = req.body as ISelectObj;

                SheetsSelectOperations.selectEntity(accessToken, domainId, spreadsheetName, sheetName, entityName, select, false, true)
                    .then(result => {
                        res.send(result);
                    }).catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    });
            });


        router.post('/sheetdata/report',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {

                let entityPackage = <IEntityPackage>req.body;
                let accessToken = req.session['google_access_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                let reportType = entityPackage['reportType'];


                SheetsSelectOperations.getCompany(accessToken, domainId)
                    .then(r => {

                        let company = r['rows'][0] as Company;
                        entityPackage.values['company'] = company;

                        if (!company)
                            throw 'Company not set!'

                        let renderer = (content, helpers) => {
                            jsreport.render({
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

                            }).catch(err => {
                                if (err && err.message && err.message.indexOf('No access, refresh token or API key is set.') >= 0)
                                    res.send({ error: { code: 401 } });
                                else
                                    res.send({ error: err });
                            });
                        };
                        if (!company.custom_invoice_report) {
                            let content = fs.readFileSync(path.join(__dirname, ('../assets/content/reports/' + reportType + '/' + reportType + '_template.html')), 'utf8');
                            let helpers = fs.readFileSync(path.join(__dirname, ('../assets/content/reports/' + reportType + '/' + reportType + '_script.js')), 'utf8');

                            return renderer(content, helpers);
                        }
                        else {
                            let invoice_files = company.custom_invoice_report.split(';')
                            DriveOperations.getConfigFile<string>(accessToken, invoice_files[0], null, eFileOperationType.read)
                                .then(c => {
                                    DriveOperations.getConfigFile<string>(accessToken, invoice_files[1], null, eFileOperationType.read).then(h => {
                                        return renderer(c, h);
                                    })

                                })
                                .catch(err => {
                                    res.send({ error: err });
                                });

                        }

                    })
                    .catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.send({ error: err });
                    });

            });








    }




}