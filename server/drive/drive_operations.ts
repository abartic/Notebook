
import * as Config from "config";
import { eFileOperationType } from '../sheets/sheets_common_operations';


var {google} = require('googleapis');
var sheets = google.sheets('v4');


export class DriveOperations {

    static writeConfigFile(accessToken: string,
        domainId :string,
        fileoperationtype: eFileOperationType,
        fileId: string,
        folderId: string,

        data: string): Promise<string> {

        
        var projId = Config.get<string>("googleConfig.clientID");
        projId = projId.split('.')[0];

        const {google: googleApi} = require('googleapis');
        const drive = googleApi.drive('v3');
        var {OAuth2Client} = require('google-auth-library');
        var oauth2Client = new OAuth2Client(); 
        oauth2Client.credentials = {
            access_token: accessToken
        };

        return new Promise<string>((cb, err_cb) => {
            let fileName = fileoperationtype.toString();
            if (fileoperationtype === eFileOperationType.moveToFolder) {
                drive.files.get(
                    {
                        fileId: fileId,
                        fields: 'parents',
                        auth: oauth2Client
                    }
                    , function (err, fileinfo) {

                        if (err) {
                            err_cb(err);
                        }

                        drive.files.update(
                            {
                                fileId: fileId,
                                auth: oauth2Client,
                                removeParents: fileinfo.data['parents'][0],
                                addParents: folderId
                            }
                            , function (err, result) {
                                if (!err) {
                                    cb(data);
                                } else {
                                    err_cb(err);
                                }
                            });
                    });
            }
            else if (fileId) {
                drive.files.update(
                    {
                        fileId: fileId,
                        media:
                        {
                            body: data,
                            mimeType: 'application/json'

                        },
                        auth: oauth2Client
                    }
                    , function (err, fileinfo) {
                        if (!err) {
                            cb(fileinfo.data.id);
                        } else {
                            err_cb(err);
                        }
                    });
            }
            else {
                drive.files.create(
                    {
                        resource: {
                            name: fileName + '_' + projId + '_' + domainId,
                            parents: fileoperationtype === eFileOperationType.folder ? [] : [folderId],
                            mimeType: fileoperationtype === eFileOperationType.folder ? "application/vnd.google-apps.folder" : 'application/json',
                            appProperties: {
                                additionalID: projId + '_' + domainId
                            }
                        },
                        media:
                        {
                            body: data,
                            mimeType: 'application/json'

                        },
                        auth: oauth2Client
                    }
                    , function (err, fileinfo) {
                        if (!err) {
                            cb(fileinfo.data.id);
                        } else {
                            err_cb(err);
                        }
                    });
            }

        });

    }

    static getConfigFile<T>(token: string, fileId: string, domainId: string, filetype: eFileOperationType): Promise<T> {
        var projId = Config.get<string>("googleConfig.clientID");
        projId = projId.split('.')[0];

        const {google: googleApi} = require('googleapis');
        const drive = googleApi.drive('v3');
        var {OAuth2Client} = require('google-auth-library');
        var oauth2Client = new OAuth2Client(); 
        oauth2Client.credentials = {
            access_token: token
        };
         
        let fileName = filetype.toString();
        return new Promise<T>((cb, err_cb) => {
            if (fileId) {
                drive.files.get(
                    {
                        fileId: fileId,
                        alt: 'media',
                        auth: oauth2Client
                    }
                    , function (err, response) {
                        if (err) {
                            err_cb(err);
                        }
                        else if (response) {
                            cb(<T>response.data);
                        }
                    });
            }
            else {
                drive.files.list(
                    {
                        q: 'name = "' + fileName + '_' + projId + '_' + domainId +
                        '" and trashed=false and appProperties has { key="additionalID" and value="' + projId + '_' + domainId + '" }',
                        auth: oauth2Client
                    }
                    , function (err, response) {
                        if (err) {
                            err_cb(err);
                        }
                        else if (response.data && response.data.files.length > 0) {
                            var file = response.data.files[0];
                            drive.files.get(
                                {
                                    fileId: file.id,
                                    alt: 'media',
                                    auth: oauth2Client
                                }
                                , function (err, response) {
                                    if (response && response.data) {
                                        let obj = <T>response.data;
                                        obj['fileId'] = file.id;
                                        cb(obj);
                                    }
                                    else {
                                        err_cb(err);
                                    }
                                });
                        }
                        else {
                            cb(null);
                        }

                    });
            }
        });

    }
}