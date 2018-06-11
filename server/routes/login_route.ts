

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
                    res.json({ 'refresh': 'true' });
                }).catch(() => {
                    res.json({ 'refresh': 'false' });
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
                        res.json({'response' : 'ok'});
                    });

                //res.redirect('https://accounts.google.com/o/oauth2/revoke?token=' + token);
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

        router.get('/login/result',
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
