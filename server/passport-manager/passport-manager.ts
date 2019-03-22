
import * as passport from "passport";
import { Strategy } from "passport-facebook";
import { OAuth2Strategy } from "passport-google-oauth";
import * as Config from "config";
import CookieSession = require('cookie-session');
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import refresh = require('passport-oauth2-refresh')
import { SheetRoute } from "../routes/sheets_route";
import { SheetsMgr } from "../common/sheets-mgr";

import { AppAcl } from "../acl/app-acl";
import { eFileOperationType } from "../sheets/sheets_common_operations";
import { DriveOperations } from "../drive/drive_operations";
import Acl = require("acl");
// import { Db } from "../models/db";
// import * as  Sequelize from "sequelize";
// import { Accounts } from "../models/accounts_dev";


/**
 * The server.
 *
 * @class PassportManager
 */
export class PassportManager {

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

    public config() {


        let authHandler = function (req, accessToken, refreshToken, profile, callBack) {

            // if (req.session.populated === false)
            //     return;

            let emails: Array<{ value: string; type?: string; }> = profile.emails;
            let emailAccounts = <Array<string>>emails.map(e => e.value);
            if (!emailAccounts || emailAccounts.length === 0) {
                callBack('user profile missing or incomplete', null);
                return;
            }

            let userId = emailAccounts[0].valueOf();
            let domain = PassportManager.getDomainByName(req.session['domainName']);
            if (domain === null || domain.isActive === false) {
                console.log('domain suspended');
                callBack('domain missing or suspended', null);
                return;
            }

            let domainId = domain.domainId;
            let f_auth = (account: IAccount) => {

                if (profile.provider === "google") {
                    req.session['google_access_token'] = accessToken;
                    req.session['google_refresh_token'] = refreshToken;
                }

                req.session['userId'] = profile.emails[0].value;
                req.session['lastAuthTime'] = Date.now().toString();
                req.session['domainId'] = domainId;
                callBack(null, profile);
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
                                let userId = emailAccounts[0];
                                DriveOperations.getConfigFile<IAccountsSet>(accessToken, ss.accountsFileId, domainId, eFileOperationType.accounts)
                                    .then(accountsSet => {
                                        if (accountsSet) {
                                            let accountIdex = accountsSet.accounts.findIndex(a => a.accountName === userId);
                                            if (accountIdex < 0) {
                                                callBack('User not enrolled!', null)
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
                                            callBack('Domain accounts missing', null);
                                        }
                                    });

                            }
                            else {
                                callBack('Data domain missing or user not enrolled', null);
                            }

                        })
                        .catch(e => {
                            console.log(e);
                            callBack(JSON.stringify(e), null);
                        });
                }

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
                failureRedirect: '/login/fail/',
                successRedirect: '/login/success/'
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
        //options['approvalPrompt'] = 'force';
        let hdl = passport.authenticate('google', options);
        return hdl;

    }

    public completeGoogleAuth() {
        return passport.authenticate('google',
            {
                failureRedirect: '/login/fail/',
                successRedirect: '/login/success/'
            }
        );
    }

    public refreshGoogleAuth(req, resolve, reject) {

        let userId = req.session['userId'];
        let accessToken = req.session['google_access_token'];
        let domainId = req.session['domainId'];
        let accountsFileId = req.session['accountsFileId'];
        if (userId === undefined || accessToken === undefined)
            return reject('User session error');

        console.log("domainID: " + domainId);
        console.log("google_refresh_token: " + req.session['google_refresh_token']);
        console.log("accessToken: " + accessToken);
        console.log("accountsFileId: " + accountsFileId);
        
        let domain = PassportManager.getDomainById(domainId);
        if (domain === null || domain.isActive === false) {
            console.log('domain suspended');
            return reject('Domain missing or suspended');
        }

        let check = () => {
            
            refresh.requestNewAccessToken('google',
                req.session['google_refresh_token'],
                function (err, accessToken, refreshToken) {
                    if (err !== null) {
                        return reject(err);
                    }
                    else {
                        req.session['google_access_token'] = accessToken;
                        req.session['lastAuthTime'] = Date.now().toString();
                        return resolve(accessToken);
                    }

                });
        };

        AppAcl.aclInstance.isAdmin((userId + domainId)).then((isAdmin) => {
            if (isAdmin) {
                check();
            }
            else {

                DriveOperations.getConfigFile<IAccountsSet>(accessToken, accountsFileId, domainId, eFileOperationType.accounts)
                    .then(accountsSet => {
                        if (accountsSet) {
                            let accountIdex = accountsSet.accounts.findIndex(a => a.accountName === userId);
                            if (accountIdex < 0) {
                                let acl = AppAcl.aclInstance.acl;
                                acl.userRoles(userId, (err, roles) => {
                                    if (err) return Promise.reject({ error: err });
                                    acl.removeUserRoles(userId, roles, (err) => {
                                        if (err) return Promise.reject({ error: err });

                                        return reject('User not enrolled');
                                    })
                                });
                            }
                            else {
                                check();
                            }
                        }
                        else {
                            return reject('Domain accounts missing', null);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        return reject(err);
                    });
            }

        });




    }
}