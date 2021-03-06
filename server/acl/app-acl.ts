
import Acl = require("acl");
import * as fs from 'fs';
import * as path from 'path';
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';

export class AppAcl {

    public acl = new Acl(new Acl.memoryBackend());

    private constructor() {
        let that = this;
        fs.readFile(path.join(__dirname, '../json/role-mapping.json'), 'utf8',
            (error, data) => {
                var obj = JSON.parse(data);
                that.acl.allow(obj['mapping']);
            });

        fs.readFile(path.join(__dirname, '../json/domains.json'), 'utf8',
            (error, data) => {
                var domains = <Array<IDomain>>JSON.parse(data);
                for (let domain of domains)
                    that.acl.addUserRoles(domain.admin.accountName + domain.domainId, "proj-admin");
            });
    }

    static aclInstance: AppAcl = null;
    public static get Instance(): AppAcl {

        if (AppAcl.aclInstance == null) {
            AppAcl.aclInstance = new AppAcl();
        }

        return AppAcl.aclInstance;
    }

    public isAdmin(userToken: string) {
        let that = this;
        return new Promise<boolean>((cb, cerr) => {
            that.acl.hasRole(userToken, 'proj-admin', (err, isAdmin) => {
                if (err)
                    cerr(err);
                else
                    cb(isAdmin);
            });
        });
    }


    public getAclRequest() {
        return (req: Request, res: Response, next: NextFunction) => {
            let userId = req.session['userId'];
            let domainId = req.session['domainId'];
            let accountsFileId = req.session['accountsFileId'];


            if (!accountsFileId) {
                res.status(401);
                return res.send({ error: 'domain data missing or account missing' });
            }

            let f_acl = this.acl.middleware(null,
                (req) => {
                    return req.session.userId + req.session.domainId;
                },
                null);

            f_acl(req, res, next);

        }
    };

}
