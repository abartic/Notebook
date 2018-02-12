import Acl = require("acl");
import * as fs from 'fs';
import * as path from 'path';


export class AppAcl {

    private acl = new Acl(new Acl.memoryBackend());

    private constructor() {

        //console.log(path.join(__dirname, 'role-mapping.json'));

        fs.readFile(path.join(__dirname, '../json/role-mapping.json'), 'utf8',
            (error, data) => {
                var obj = JSON.parse(data);
                this.acl.allow(obj['mapping']);
            });


        this.acl.addUserRoles("alexandrubartic@gmail.com", "guest");
        this.acl.addUserRoles("gabibartic@gmail.com", "guest");
        this.acl.addUserRoles("titrezu2003@gmail.com", "guest");
    }

    static aclInstance : AppAcl = null;
    public static get Instance() :  AppAcl {

        if (AppAcl.aclInstance == null)
        {
            AppAcl.aclInstance = new AppAcl();
        }
        return AppAcl.aclInstance;
    }

    public getAclRequest() {
        return this.acl.middleware();
    }

    public isAllowed(user : String, resource : String) {
        return this.acl.isAllowed(user, resource, ['get'] );
    }
}