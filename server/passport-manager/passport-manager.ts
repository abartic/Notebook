
import * as passport from "passport";
import { Strategy } from "passport-facebook";
import { OAuth2Strategy } from "passport-google-oauth";
import * as Config from "config";
import CookieSession = require('cookie-session');
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import refresh = require('passport-oauth2-refresh')
import { SheetRoute, eFileOperationType } from "../routes/sheets_route";
import { SheetsMgr } from "../common/sheets-mgr";
import { AccountsMgr } from "../common/accounts-mgr";
import { AppAcl } from "../acl/app-acl";

// import { Db } from "../models/db";
// import * as  Sequelize from "sequelize";
// import { Accounts } from "../models/accounts_dev";


/**
 * The server.
 *
 * @class PassportManager
 */
export class PassportManager {



    public config() {


        let authHandler = function (req, accessToken, refreshToken, profile, callBack) {

            let emails: Array<{ value: String; type?: String; }> = profile.emails;
            let emailAccounts = <Array<String>>emails.map(e => e.value);
            if (!emailAccounts || emailAccounts.length === 0)
                callBack(null, null);

            let userId = emailAccounts[0].valueOf();
            let f_auth = () => {
                if (profile.provider === "google") {
                    req.session['google_access_token'] = accessToken;
                    req.session['google_refresh_token'] = refreshToken;
                }

                req.session['userId'] = profile.emails[0].value;
                req.session['lastAuthTime'] = Date.now().toString();
                //req.session['status_timestamp'] = account.enrollmentDate;
                callBack(null, profile);
            };
            
            AppAcl.aclInstance.isAdmin(userId).then((isAdmin) => {
                if (isAdmin) {
                    f_auth();
                }
                else {
                    SheetsMgr.uniqueInstance.get(accessToken)
                        .then((ss) => {
                            if (ss && ss.accountsFileId) {
                                AccountsMgr.uniqueInstance.getAccounts(accessToken, ss.accountsFileId)
                                    .then(accountsSet => {
                                        for (let account of accountsSet.accounts) {
                                            if (emailAccounts.indexOf(account.accountName) > -1) {
                                                if (account !== undefined) {
                                                    f_auth();
                                                    return;
                                                }
                                            }
                                        }
                                        callBack(null, null);
                                    });
                            }
                        });
                }
            }).catch(e => {
                console.log(e);
                callBack(null, null);
            });



            // let accounts = new Accounts(Db.instance);
            // return accounts.checkUser(profile.emails).then(existsUser => {
            // });
        }

        passport.use('facebook', new Strategy({
            clientID: Config.get<string>("facebookConfig.clientID"),
            clientSecret: Config.get<string>("facebookConfig.clientSecret"),
            callbackURL: Config.get<string>("facebookConfig.facebookAuthCallbackURL"),
            profileFields: Config.get<Array<string>>("facebookConfig.profileFields"),
            passReqToCallback: true,

        },
            authHandler
        ));

        let googleStrategy = new OAuth2Strategy({
            clientID: Config.get<string>("googleConfig.clientID"),
            clientSecret: Config.get<string>("googleConfig.clientSecret"),
            callbackURL: Config.get<string>("googleConfig.googleAuthCallbackURL"),
            passReqToCallback: true,
        },
            authHandler);
        passport.use('google', googleStrategy);

        passport.serializeUser(function (user, callBack) {
            callBack(null, user);
        });

        passport.deserializeUser(function (user, callBack) {
            callBack(null, user);
        });

        refresh.use(googleStrategy);
    }

    public init() {
        return passport.initialize();
    }

    public session() {
        return passport.session();
    }

    public initFacebookAuth() {
        return passport.authenticate('facebook',
            {
                scope: Config.get<Array<string>>("facebookConfig.permissions")
            });
    }

    public completeFacebookAuth() {
        return passport.authenticate('facebook',
            {
                failureRedirect: '/login/result/',
                successRedirect: '/login/result/'
            }
        );
    }

    public initGoogleAuth() {
        let options = {
            scope: [
                'email profile',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.metadata.readonly',
                'https://spreadsheets.google.com/feeds'
            ]


        };
        //overwirte
        options['accessType'] = 'offline';
        options['prompt'] = 'consent';
        let hdl = passport.authenticate('google', options);
        return hdl;

    }

    public completeGoogleAuth() {
        return passport.authenticate('google',
            {
                failureRedirect: '/login/result/',
                successRedirect: '/login/result/'
            }
        );
    }

    public refreshGoogleAuth(req, resolve, reject) {

        refresh.requestNewAccessToken('google',
            req.session['google_refresh_token'],
            function (err, accessToken, refreshToken) {
                if (err !== null) {
                    reject(err);
                }
                else {
                    req.session['google_access_token'] = accessToken;
                    req.session['lastAuthTime'] = Date.now().toString();
                    resolve(accessToken);
                }

            });

    }
}