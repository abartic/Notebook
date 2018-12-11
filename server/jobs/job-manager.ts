import { SheetsCommonOperations } from './../sheets/sheets_common_operations';

import * as path from 'path';
import * as fs from 'fs';
import { SheetsSelectOperations } from '../sheets/sheets_select_operations';
let google = require('googleapis');
let CronJob = require('cron').CronJob;

export class JobManager {

    public static startJobs() {
        let data = fs.readFileSync(path.join(__dirname, '../json/jobs.json'), 'utf8');
        let jobDefinitions = JSON.parse(data);
        for (let jobDefinition of jobDefinitions) {


            for (let job of jobDefinition.jobs) {
                if (job.isActive === false)
                    continue;

                new CronJob(job.schedule, function () {

                    let jwtClient = new google.auth.JWT(
                        jobDefinition.account,
                        null,
                        jobDefinition.private_key,
                        jobDefinition.scope);

                    jwtClient.authorize(function (err, tokens) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            let props = job.notify_body_list_info.split(',');

                            SheetsSelectOperations.selectEntity(tokens['access_token'], tokens['access_token'] + '-' + jobDefinition.domainId,
                                job.spreadsheetName,
                                job.sheetName,
                                job.entityName, job.select, false, false)
                                .then(result => {
                                    if (!result)
                                        return;

                                    let body = job.notify_body + '\n';

                                    for (let prop of props) {
                                        body += prop + ', ';
                                    }
                                    body += '\n';

                                    for (let item of <Array<any>>result['rows']) {
                                        for (let prop of props) {
                                            body += item[prop] + ', ';
                                        }
                                        body += '\n';
                                    }
                                    JobManager.sendEmail(job.notify_recepients, job.notify_subject, body);
                                }).catch(err => {
                                    console.log(err);
                                    return;
                                });
                        }

                    });
                }, null, true, job.schedule_TZ);

            }
        }
    }

    private static sendEmail(to, subject, body) {
        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'alexandrubartic@gmail.com',
                pass: 'xkcagwsjeuehcsuj'
            }
        });

        var mailOptions = {
            from: 'alexandrubartic@gmail.com',
            to: to,
            subject: subject,
            text: body
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}