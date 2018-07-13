
import { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { BaseRoute } from './route';
import * as request from 'request-promise';
import * as Config from "config";
import { eFileOperationType } from './sheets_route';

var googleApi = require('googleapis');
var sheets = googleApi.sheets('v4');


export class DriverRoute extends BaseRoute {

    static writeConfigFile(req: Request,
        fileoperationtype: eFileOperationType,
        fileId: string,
        folderId: string,
        data: string): Promise<string> {

        var projId = Config.get<string>("googleConfig.clientID");
        projId = projId.split('.')[0];

        var googleApi = require('googleapis');
        var googleAuth = require('google-auth-library');
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2();
        oauth2Client.credentials = {
            access_token: req.session['google_access_token']
        };
        const drive = googleApi.drive({ version: 'v3' });

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
                                removeParents: fileinfo['parents'][0],
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
                            cb(fileinfo.id);
                        } else {
                            err_cb(err);
                        }
                    });
            }
            else {
                drive.files.create(
                    {
                        resource: {
                            name: fileName + '_' + projId,
                            parents: fileoperationtype === eFileOperationType.folder ? [] : [folderId],
                            mimeType: fileoperationtype === eFileOperationType.folder ? "application/vnd.google-apps.folder" : 'application/json',
                            appProperties: {
                                additionalID: projId
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
                            cb(fileinfo.id);
                        } else {
                            err_cb(err);
                        }
                    });
            }

        });

    }

    static getConfigFile<T>(token: string, fileId: string, filetype: eFileOperationType): Promise<T> {
        var projId = Config.get<string>("googleConfig.clientID");
        projId = projId.split('.')[0];

        var googleApi = require('googleapis');
        var googleAuth = require('google-auth-library');
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2();
        oauth2Client.credentials = {
            access_token: token
        };
        const drive = googleApi.drive({ version: 'v3' });
        let fileName = filetype.toString();
        return new Promise<T>((cb, err_cb) => {
            if (fileId) {
                drive.files.get(
                    {
                        fileId: fileId,
                        alt: 'media',
                        auth: oauth2Client
                    }
                    , function (err, data) {
                        if (err) {
                            err_cb(err);
                        }
                        else if (data) {
                            cb(<T>data);
                        }
                    });
            }
            else {
                drive.files.list(
                    {
                        q: 'name = "' + fileName + '_' + projId +
                        '" and trashed=false and appProperties has { key="additionalID" and value="' + projId + '" }',
                        auth: oauth2Client
                    }
                    , function (err, data) {
                        if (err) {
                            err_cb(err);
                        }
                        else if (data && data.files.length > 0) {
                            var file = data.files[0];
                            drive.files.get(
                                {
                                    fileId: file.id,
                                    alt: 'media',
                                    auth: oauth2Client
                                }
                                , function (err, data) {
                                    if (data) {
                                        let obj = <T>data;
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