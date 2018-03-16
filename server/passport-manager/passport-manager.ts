

import * as passport from "passport";
import { Strategy } from "passport-facebook";
import { OAuth2Strategy } from "passport-google-oauth";
import * as Config from "config";
import CookieSession = require('cookie-session');
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import * as fs from 'fs';
import * as path from 'path';

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

            console.log(profile);

            let data = fs.readFileSync(path.join(__dirname, ('../json/accounts.json')), 'utf8');
            let accounts = <Array<IAccount>>(JSON.parse(data));
            let emails: Array<{ value: String; type?: String; }> = profile.emails;
            var emailAccounts = <Array<String>>emails.map(e => e.value);
            for (let account of accounts) {
                if (emailAccounts.indexOf(account.accountName) > -1) {
                    if (account !== undefined) {
                        if (profile.provider === "google")
                            req.session['google_access_token'] = accessToken;
                        else
                            req.session['fbk_access_token'] = accessToken;
                        req.session['userId'] = profile.emails[0].value;
                        req.session['lastAuthTime'] = Date.now().toString();
                        callBack(null, profile);
                    }
                    else {
                        callBack(null, profile);
                    }
                    return;
                }
            }

            // let accounts = new Accounts(Db.instance);
            // return accounts.checkUser(profile.emails).then(existsUser => {
            // });
        }

        passport.use('facebook', new Strategy({
            clientID: Config.get<string>("facebookConfig.clientID"),
            clientSecret: Config.get<string>("facebookConfig.clientSecret"),
            callbackURL: Config.get<string>("facebookConfig.facebookAuthCallbackURL"),
            profileFields: Config.get<Array<string>>("facebookConfig.profileFields"),
            passReqToCallback: true
        },
            authHandler
        ));

        passport.use('google', new OAuth2Strategy({
            clientID: Config.get<string>("googleConfig.clientID"),
            clientSecret: Config.get<string>("googleConfig.clientSecret"),
            callbackURL: Config.get<string>("googleConfig.googleAuthCallbackURL"),
            passReqToCallback: true
        },
            authHandler));

        passport.serializeUser(function (user, callBack) {
            callBack(null, user);
        });

        passport.deserializeUser(function (user, callBack) {
            callBack(null, user);
        });
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
        return passport.authenticate('google', {
            scope: [
                'email profile',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets',
                'https://spreadsheets.google.com/feeds'
            ]

        });
    }

    public completeGoogleAuth() {
        return passport.authenticate('google',
            {
                failureRedirect: '/login/result/',
                successRedirect: '/login/result/'
            }
        );
    }
}