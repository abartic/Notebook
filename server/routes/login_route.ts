
import { AppAcl } from './../acl/app-acl';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import { PassportManager } from '../passport-manager/passport-manager';
import * as request from 'request-promise';
import acl = require('acl');
import { LogsManager } from '../logs/logs-manager';
import * as Config from "config";
import * as fs from 'fs';
import * as path from 'path';
import { SheetsMgr } from '../common/sheets-mgr';
import { DriveOperations } from '../drive/drive_operations';
import { eFileOperationType } from '../sheets/sheets_common_operations';
import { Security } from '../common/security';



export class LoginRoute extends BaseRoute {

    constructor() {
        super();
    }

    private static arrayContains(array, otherArray) {
        return !array.some(function (item) {
            return otherArray.indexOf(item) === -1;
        });
    }

    private static getDomainById(domainId) {
        let data = fs.readFileSync(path.join(__dirname, '../json/domains.json'), 'utf8')
        var domains = <Array<IDomain>>JSON.parse(data);
        for (let domain of domains) {
            if (domain.domainId === domainId) {
                return domain;
            }
        }
        return null;
    }

    private static getDomainByName(domainName) {
        let data = fs.readFileSync(path.join(__dirname, '../json/domains.json'), 'utf8')
        var domains = <Array<IDomain>>JSON.parse(data);
        for (let domain of domains) {
            if (domain.domainName === domainName) {
                return domain;
            }
        }
        return null;
    }


    private static authHandler(req, accessToken, domainName, userId, language, callback) {

        let domain = LoginRoute.getDomainByName(domainName);
        if (domain === null || domain.isActive === false) {
            console.log('domain suspended');
            callback(false);
        }

        let domainId = domain.domainId;
        let f_auth = (account: IAccount) => {

            req.session['google_access_token'] = accessToken;
            req.session['userId'] = userId;
            req.session['lastAuthTime'] = Date.now().toString();
            req.session['domainName'] = domainName;
            req.session['domainId'] = domainId;
            req.session['language'] = language;
            callback(true);
        };

        AppAcl.aclInstance.isAdmin((userId + domainId)).then((isAdmin) => {
            if (isAdmin) {
                req.session['accountsFileId'] = 'none';
                //req.session['enrollmentDate'] = 0;
                f_auth(null);
            }
            else {
                SheetsMgr.uniqueInstance.get(accessToken, domainId)
                    .then((ss) => {
                        if (ss && ss.accountsFileId) {

                            DriveOperations.getConfigFile<IAccountsSet>(accessToken, ss.accountsFileId, domainId, eFileOperationType.accounts)
                                .then(accountsSet => {
                                    if (accountsSet) {
                                        let accountIdex = accountsSet.accounts.findIndex(a => a.accountName === userId);
                                        if (accountIdex < 0) {

                                        }
                                        else {
                                            let account = accountsSet.accounts[accountIdex];
                                            let acl = AppAcl.aclInstance.acl;
                                            acl.userRoles(userId, (err, roles) => {
                                                if (err) return Promise.reject({ error: err });
                                                acl.removeUserRoles(userId, roles, (err) => {
                                                    if (err) return Promise.reject({ error: err });
                                                    acl.addUserRoles(account.accountName + domainId, account.role,
                                                        (err) => {
                                                            if (err) return Promise.reject({ error: err });
                                                            req.session['accountsFileId'] = ss.accountsFileId;
                                                            //req.session['enrollmentDate'] = account.enrollmentDate;
                                                            f_auth(account);
                                                        });

                                                })
                                            });

                                        }
                                    }
                                    else {
                                        callback(false);
                                    }

                                });

                        }
                        else {
                            callback(false);
                        }

                    })
                    .catch(e => {
                        console.log(e);
                        callback(false);
                    });
            }

        });

    }

    public static create(router: Router, passportManager: PassportManager, csrfProtection: RequestHandler) {




        router.post('/login/google/checktoken',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let { accessToken } = req.body;
                request({
                    method: 'GET',
                    uri: 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken,

                }).then(res => {
                    if (res.error)
                        res.json({ 'response': 'expired' });
                    else
                        res.json({ 'response': 'valid' });
                })
                    .catch(err => {
                        res.json({ 'response': 'expired' });
                    });
            });

        router.get('/login/google/init',
            (req: Request, res: Response, next: NextFunction) => {

                //set csrf cookie
                let token = req.csrfToken();
                res.cookie("xsrf-token", token);
                res.send({});
            });

        router.get('/login/google/getprofile',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {

                if (req.session['domainName'] && req.session['userId']) {
                    let userprof = {
                        error: null, refresh: true,
                        DomainName: req.session['domainName'],
                        DomainId: req.session['domainId'],
                        Username: req.session['userId'],
                        LastAuthTime: req.session['lastAuthTime'],
                        Language: req.session['language'],

                    };
                    console.log(userprof);
                    res.send(userprof);
                }
                else {
                    res.send({
                        error: 'no_profile',
                        refresh: false,
                    });
                }
            });

        router.post('/login/google/success2',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                let { domainName, language, accessToken, idToken } = req.body;
                var { OAuth2Client } = require('google-auth-library');
                const client = new OAuth2Client(Config.get<string>("googleConfig.clientID"));
                async function verify() {
                    const ticket = await client.verifyIdToken({
                        idToken: idToken,
                        audience: Config.get<string>("googleConfig.clientID"),
                    });
                    const payload = ticket.getPayload();

                    let token_validity_str = await request({
                        method: 'GET',
                        uri: 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken,

                    });

                    let token_validity = JSON.parse(token_validity_str);
                    if (token_validity.error || !token_validity.scope)
                        return res.send({ error: null, refresh: false });

                    let scopes = token_validity.scope.split(' ');
                    if (LoginRoute.arrayContains(Security.GoogleLoginScopes, scopes) === false)
                        return res.send({ error: null, refresh: false });

                    LoginRoute.authHandler(req, accessToken, domainName, payload.email, language, function (result) {
                        if (result === true) {

                            res.send({
                                error: null, refresh: true,
                                DomainName: req.session['domainName'],
                                DomainId: req.session['domainId'],
                                Username: req.session['userId'],
                                LastAuthTime: req.session['lastAuthTime'],
                                Language: req.session['language'],
                            });
                        }
                    });

                }
                verify().catch((error) => {
                    console.error
                    res.send({ error: error, refresh: false });
                });

            });

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
            },
            passportManager.initGoogleAuth()

        );

        router.get('/login/google/return',
            csrfProtection,
            passportManager.completeGoogleAuth());

        router.get('/login/success',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                req.query["callback"] = req.session['callback'];
                let isUserVerified = req.session['userId'] !== null;
                // res.cookie('google_access_token', req.session['google_access_token']);
                // res.cookie('google_refresh_token', req.session['google_refresh_token']);
                // res.cookie('lastAuthTime', req.session['lastAuthTime']);
                // res.cookie('userId', req.session['userId']);
                // res.cookie('domainId', req.session['domainId']);
                // res.cookie('domainName', req.session['domainName']);
                // res.cookie('accountsFileId', req.session['accountsFileId']);

                res.redirect("/");
            });

        router.get('/login/fail',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                req.query["callback"] = req.session['callback'];
                let isUserVerified = req.session['userId'] !== null;

                // res.cookie('google_access_token', '');
                // res.cookie('google_refresh_token', '');
                // res.cookie('lastAuthTime', '');
                // res.cookie('domainId', '');
                // res.cookie('domainName', '');
                // res.cookie('accountsFileId', '');
                // res.cookie('userId', req.session['userId']);
                res.redirect("/");
            });


        router.get('/logout/google',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {
                let accessToken = req.session['google_access_token'];
                let refreshToken = req.session['google_refresh_token'];
                let domainId = req.session['domainId'];
                let userId = req.session['userId'];

                if (!refreshToken && !accessToken) {
                    res.json({ 'response': 'ok' });
                }
                else {

                    request({
                        method: 'GET',
                        uri: 'https://accounts.google.com/o/oauth2/revoke?token=' + accessToken,

                    }).then(fbRes => {
                        if (refreshToken) {
                            request({
                                method: 'GET',
                                uri: 'https://accounts.google.com/o/oauth2/revoke?token=' + refreshToken,

                            }).then(fbRes => {
                                res.json({ 'response': 'ok' });
                            })
                                .catch(err => {
                                    console.log(err);
                                    LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                                    res.json({ 'response': 'failed' });
                                });
                        }
                        else {
                            res.json({ 'response': 'ok' });
                        }
                    }).catch(err => {
                        console.log(err);
                        LogsManager.uniqueInstance.write(userId, domainId, JSON.stringify(err));
                        res.json({ 'response': 'failed' });
                    });
                }

            }
        );

        router.get('/login/mainmenu',
            csrfProtection,
            AppAcl.Instance.getAclRequest(),
            (req: Request, res: Response, next: NextFunction) => {

                let userId = req.session['userId'];
                let domainId = req.session['domainId'];
                let mainmenu = [
                    { link: '/dashboard', caption: 'MENU.DASHBOARD', image: 'fa fa-fw fa-dashboard' },
                    { link: '/form/article', caption: 'MENU.ARTICLE', image: 'fa fa-barcode' },
                    { link: '/form/prospect', caption: 'MENU.PROSPECTS', image: 'fa fa-user-plus' },
                    { link: '/form/partner', caption: 'MENU.PARTNERS', image: 'fa fa-users' },
                    { link: '/form/store', caption: 'MENU.STORES', image: 'fa fa-archive' },
                    { link: '/form/invoice', caption: 'MENU.INVOICE', image: 'fa fa-arrows-alt' },
                    { link: '/form/receivable', caption: 'MENU.RECEIVABLES', image: 'fa fa-usd' },
                    { link: '/form/purchase', caption: 'MENU.PURCHASES', image: 'fa fa-cart-arrow-down' },
                    { link: '/form/payment', caption: 'MENU.PAYMENTS', image: 'fa fa-credit-card' },
                    { link: '/form/articleinventory', caption: 'MENU.STOCKS', image: 'fa fa-cubes' },
                    { link: '/form/accountinventory', caption: 'MENU.ACCOUNT_STATS', image: 'fa fa-calculator' },
                    { link: '/form/budget', caption: 'MENU.BUDGETS', image: 'fa fa-columns' },
                    { link: '/form/expenses', caption: 'MENU.EXPENSES', image: 'fa fa-money' },
                ];
                let admin_mainmenu = [
                    { link: '/form/company', caption: 'MENU.SETTINGS', image: 'fa fa-fw fa-wrench' },
                    { link: '/sheets-creation', caption: 'MENU.SHEETS_ADMIN', image: 'fa fa-table' }
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
                        // res.cookie('google_access_token', req.session['google_access_token']);
                        // res.cookie('google_refresh_token', req.session['google_refresh_token']);
                        // res.cookie('lastAuthTime', req.session['lastAuthTime']);
                    }
                    res.json({ 'refresh': true });
                }).catch((err) => {

                    res.json({ 'refresh': false });
                });

            },

        );

    }

}
