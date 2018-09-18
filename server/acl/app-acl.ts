import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Acl = require("acl");
import * as fs from 'fs';
import * as path from 'path';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { SheetRoute } from "../routes/sheets_route";
import { SheetsMgr } from '../common/sheets-mgr';
import { AccountsMgr } from '../common/accounts-mgr';

export class AppAcl {

    private acl = new Acl(new Acl.memoryBackend());
    

    

    private constructor() {

        fs.readFile(path.join(__dirname, '../json/role-mapping.json'), 'utf8',
            (error, data) => {
                var obj = JSON.parse(data);
                this.acl.allow(obj['mapping']);
            });

        fs.readFile(path.join(__dirname, '../json/admins.json'), 'utf8',
            (error, data) => {
                var accounts = <Array<IAccount>>JSON.parse(data);
                for (let account of accounts)
                    this.acl.addUserRoles(account.accountName, "proj-admin");
            });
    }

    static aclInstance: AppAcl = null;
    public static get Instance(): AppAcl {

        if (AppAcl.aclInstance == null) {
            AppAcl.aclInstance = new AppAcl();
        }

        return AppAcl.aclInstance;
    }

    public isAdmin(userId: string) {
        return new Promise<boolean>((cb, cerr) => this.acl.hasRole(userId, 'proj-admin', (err, isAdmin) => {
            if (err)
                cerr(err);
            else
                cb(isAdmin);
        }));
    }

    public getAclRequest() {
        return (req: Request, res: Response, next: NextFunction) => {
            let token = req.session['google_access_token'];
            let userId = req.session['userId'];
            //let status_timestamp: number = req.session['status_timestamp'];
            let f_acl = this.acl.middleware();

            this.acl.hasRole(userId, 'proj-admin', (err, isAdmin) => {
                if (isAdmin) {
                    f_acl(req, res, next);
                }
                else {

                    SheetsMgr.uniqueInstance.get(token)
                        .then(spreadsheetsSet => {
                            if (spreadsheetsSet === null || spreadsheetsSet.spreadsheets.length === 0) {
                                return Promise.reject({ error: 'Sheets not created!' });
                            }
                            return AccountsMgr.uniqueInstance.getAccount(token, spreadsheetsSet.accountsFileId, userId);
                        })
                        .then(account => {
                            if (!account)
                                return Promise.reject({ error: 'Account not enrolled!' });

                            this.acl.userRoles(userId, (err, roles) => {

                                if (err) return Promise.reject({ error: err });
                                this.acl.removeUserRoles(userId, roles, (err) => {
                                    if (err) return Promise.reject({ error: err });

                                    this.acl.addUserRoles(account.accountName, account.role);
                                    f_acl(req, res, next);
                                })
                            });
                        })
                }
            });
        };
    }


    public isAllowed(user: String, resource: String) {
        return this.acl.isAllowed(user, resource, ['get']);
    }
}