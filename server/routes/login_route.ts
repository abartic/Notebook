

import { AppAcl } from './../acl/app-acl';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import { PassportManager } from '../passport-manager/passport-manager';
import * as request from 'request-promise';
import acl = require('acl');
import CookieSession = require('cookie-session');
import { LogsManager } from '../logs/logs-manager';


export class LoginRoute extends BaseRoute {

    constructor() {
        super();
    }

    // tslint:disable-next-line:member-ordering
    public static create(router: Router, passportManager: PassportManager, csrfProtection: RequestHandler) {

        router.get('/login/google/domain/:domainName',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                req.session['userId'] = null;
                req.session['domainId'] = null;
                req.session['accountsFileId'] = null;
                //req.session['enrollmentDate'] = null;
                req.session['domainName'] = req.params.domainName;
                var fn = req.query["callback"];
                req.session['callback'] = fn;
                next();
            }, passportManager.initGoogleAuth()
        );

        router.get('/login/google/return',
            csrfProtection,
            passportManager.completeGoogleAuth());

        router.get('/login/success',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                req.query["callback"] = req.session['callback'];
                let isUserVerified = req.session['userId'] !== null;



                // res.jsonp({ 
                //     isAuthorized: isUserVerified,
                //     google_access_token : req.session['google_access_token'],
                //     fbk_access_token : req.session['fbk_access_token'],
                //  });
                res.cookie('google_access_token', req.session['google_access_token']);
                res.cookie('google_refresh_token', req.session['google_refresh_token']);
                res.cookie('lastAuthTime', req.session['lastAuthTime']);
                res.cookie('userId', req.session['userId']);
                res.cookie('domainId', req.session['domainId']);
                res.cookie('domainName', req.session['domainName']);
                res.cookie('accountsFileId', req.session['accountsFileId']);
                //res.cookie('enrollmentDate', req.session['enrollmentDate']);
                
                res.redirect("/");
            });

        router.get('/login/fail',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                req.query["callback"] = req.session['callback'];
                let isUserVerified = req.session['userId'] !== null;

                res.cookie('google_access_token', '');
                res.cookie('google_refresh_token', '');
                res.cookie('lastAuthTime', '');
                res.cookie('domainId', '');
                res.cookie('domainName', '');
                res.cookie('accountsFileId', '');
                //res.cookie('enrollmentDate', '');
                res.cookie('userId', req.session['userId']);
                res.redirect("/");
            });


        router.get('/logout/google',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {
                let token = req.session['google_refresh_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];
                const options = {
                    method: 'GET',
                    uri: 'https://accounts.google.com/o/oauth2/revoke?token=' + token,

                };
                request(options)
                    .then(fbRes => {
                        res.json({ 'response': 'ok' });
                    })
                    .catch(err => {
                        console.log(err);
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.json({ 'response': 'failed' });
                    });

            },

        );

        router.get('/login/mainmenu',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {

                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                let mainmenu = [
                    { link: '/dashboard', caption: 'Dashboard', image: 'fa fa-fw fa-dashboard' },
                    { link: '/form/article', caption: 'Articles', image: 'fa fa-fw fa-table' },
                    { link: '/form/prospect', caption: 'Prospects', image: 'fa fa-fw fa-table' },
                    { link: '/form/partner', caption: 'Partners', image: 'fa fa-fw fa-table' },
                    { link: '/form/store', caption: 'Stores', image: 'fa fa-fw fa-table' },
                    { link: '/form/invoice', caption: 'Invoices', image: 'fa fa-fw fa-table' },
                    { link: '/form/receivable', caption: 'Receivables', image: 'fa fa-fw fa-table' },
                    { link: '/form/purchase', caption: 'Purchases', image: 'fa fa-fw fa-table' },
                    { link: '/form/payment', caption: 'Payments', image: 'fa fa-fw fa-table' },
                    { link: '/form/articleinventory', caption: 'Stocks', image: 'fa fa-fw fa-table' },
                    { link: '/form/accountinventory', caption: 'Accounts stats.', image: 'fa fa-fw fa-table' },
                    { link: '/form/budget', caption: 'Budgets', image: 'fa fa-fw fa-table' },
                    { link: '/form/expenses', caption: 'Expenses', image: 'fa fa-fw fa-table' },
                ];
                let admin_mainmenu = [
                    { link: '/form/company', caption: 'Settings', image: 'fa fa-fw fa-wrench' },
                    { link: '/sheets-creation', caption: 'Admin Sheets', image: 'fa fa-fw fa-wrench' }
                ];
                AppAcl.aclInstance.isAdmin((userId + domainId))
                    .then((isAdmin) => {
                        if (isAdmin) {
                            res.json(mainmenu.concat(admin_mainmenu));
                        }
                        else {
                            res.json(mainmenu);
                        }
                    })
                    .catch(err => {
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.json([]);
                    });
            });


        router.get('/login/google/refresh',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {
                let old_access_token = req.session['google_access_token'];
                let promise = new Promise((resolve, reject) => {
                    passportManager.refreshGoogleAuth(req, resolve, reject);
                });

                promise.then((result) => {
                    if (old_access_token !== req.session['google_access_token']) {
                        res.cookie('google_access_token', req.session['google_access_token']);
                        res.cookie('google_refresh_token', req.session['google_refresh_token']);
                        res.cookie('lastAuthTime', req.session['lastAuthTime']);
                    }
                    res.json({ 'refresh': true });
                }).catch((err) => {
                    
                    res.json({ 'refresh': false });
                });

            },

        );

    }

}
