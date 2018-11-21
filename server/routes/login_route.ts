

import { AppAcl } from './../acl/app-acl';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import { PassportManager } from '../passport-manager/passport-manager';
import * as request from 'request-promise';
import acl = require('acl');
import CookieSession = require('cookie-session');


export class LoginRoute extends BaseRoute {

    constructor() {
        super();
    }

    // tslint:disable-next-line:member-ordering
    public static create(router: Router, passportManager: PassportManager, csrfProtection: RequestHandler) {

        router.post('/checkAuthorization',
            csrfProtection,
            (req: Request, res: Response, next: NextFunction) => {
                new LoginRoute().checkAuthorization(req, res, next);
            });

        router.get('/login/google',
            (req: Request, res: Response, next: NextFunction) => {
                req.session['userId'] = null;
                req.session['domainId'] = null;
                req.session['domainName'] = null;
                var fn = req.query["callback"];
                req.session['callback'] = fn;
                next();
            },
            passportManager.initGoogleAuth()
        );

        router.get('/login/google/refresh',
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
                }).catch(() => {
                    res.json({ 'refresh': false });
                });

            },

        );

        router.get('/logout/google',
            (req: Request, res: Response, next: NextFunction) => {
                let token = req.session['google_refresh_token'];
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
                        res.json({ 'response': 'failed' });
                    });

            },

        );

        router.get('/login/google/return', passportManager.completeGoogleAuth());

        router.get('/login/facebook',
            (req: Request, res: Response, next: NextFunction) => {
                req.session['userId'] = null;
                var fn = req.query["callback"];
                req.session['callback'] = fn;
                next();
            },
            passportManager.initFacebookAuth()

        );

        router.get('/login/facebook/return',
            passportManager.completeFacebookAuth()
        );

        router.get('/login/success',
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
                res.redirect("/");
            });

        router.get('/login/fail',
            (req: Request, res: Response, next: NextFunction) => {
                req.query["callback"] = req.session['callback'];
                let isUserVerified = req.session['userId'] !== null;

                res.cookie('google_access_token', '');
                res.cookie('google_refresh_token', '');
                res.cookie('lastAuthTime', '');
                res.cookie('domainId', '');
                res.cookie('domainName', '');
                res.cookie('userId', req.session['userId']);
                res.redirect("/");
            });

        router.get('/facebook-search/:id',
            (req, res) => {

                // you need permission for most of these fields
                // tslint:disable-next-line:max-line-length
                const userFieldSet = 'id, name, about, email, accounts, link, is_verified, significant_other, relationship_status, website, picture, photos, feed';

                const options = {
                    method: 'GET',
                    uri: `https://graph.facebook.com/v2.9/${req.params.id}`,
                    qs: {
                        access_token: req.session['fbk_access_token'],
                        fields: userFieldSet
                    }
                };
                request(options)
                    .then(fbRes => {
                        res.json(fbRes);
                    });
            });

        router.get('/login/mainmenu',
            (req: Request, res: Response, next: NextFunction) => {

                let userId = req.session['userId'];

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
                    { link: '/form/company', caption: 'Settings', image: 'fa fa-fw fa-wrench'},
                    { link: '/sheets-creation', caption: 'Generate Sheets', image: 'fa fa-fw fa-wrench'}
                ];
                AppAcl.aclInstance.isAdmin(userId)
                    .then((isAdmin) => {
                        if (isAdmin) {
                            res.json(mainmenu.concat(admin_mainmenu));
                        }
                        else {
                            res.json(mainmenu);
                        }
                    })
                    .catch(err => {
                        res.json([]);
                    });
            });
    }

    public checkAuthorization(req: Request, res: Response, next: NextFunction) {
        var authReq = req.body;
        var result = false;
        if (AppAcl.Instance.isAllowed(req.session.userId, authReq.resource))
            result = true;
        res.send({
            isAuthorized: true
        });
    }

}
