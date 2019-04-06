

/*cordova*/
//declare var device;

import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Security } from '../../../server/common/security';



@Injectable({
    providedIn: 'root',
})
export class GooglePlusLoginService implements IGoogleLogin {

    private auth2 = null;
    constructor(private httpCaller: HttpCallerService) {

        /*cordova google plus */
        console.log('cordova!');
        console.log(document)
        let that = this;
        this.auth2 = new Promise((cb) => {
            document.addEventListener('deviceready', function () {
                console.log('Device is ready!');

                that.httpCaller.callGetAsText('/',
                    () => {
                        cb(true);
                    });
            }, false);
        });
    }

    public signIn(domainName) {
        let that = this;
        return new Promise<{ email?: string, id_token?: string, domainName?: string, domainId?: string }>((cb, errcb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(null);
                window['plugins'].googleplus.login(
                    {
                        'scopes': Security.GoogleLoginScopes.join(' '),
                        'webClientId': environment.clientId//'client id of the web app/server side', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                        //'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                    },
                    function (authprofile) {
                        alert(JSON.stringify(authprofile));

                        that.httpCaller.callPost('/login/success2',
                            { domainName: domainName, accessToken: authprofile.accessToken, idToken: authprofile.idToken },
                            (r) => {
                                if (cb) {
                                    cb({
                                        email: authprofile.email,
                                        id_token: authprofile.id_token,
                                        domainName: r.domainName,
                                        domainId: r.domainId,
                                    })
                                }
                                else {
                                    return errcb(null);
                                }
                            },
                            (err) => {
                                if (errcb)
                                    errcb(err);
                            });
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            });
        });
    }

    public isSignedIn(domainName) {


        console.log("isSignedIn?")
        let that = this;
        return new Promise<{ email?: string, id_token?: string }>((cb, errcb) => {
            this.auth2.then(a2 => {
                console.log(a2)

                if (a2 === null)
                    return cb(null);

                console.log(window)
                console.log(window['plugins'].googleplus)
                window['plugins'].googleplus.login(
                    {
                        'scopes': Security.GoogleLoginScopes.join(' '),
                        'webClientId': environment.clientId,
                        'offline': true
                    },
                    function (authprofile) {
                        console.log(authprofile)
                        that.httpCaller.callPost('/login/success2',
                            { domainName: domainName, accessToken: authprofile.accessToken, idToken: authprofile.idToken },
                            (r) => {
                                console.log(r)
                                if (cb) {
                                    return cb({
                                        email: authprofile.email,
                                        id_token: authprofile.idToken,
                                    });
                                }
                                else {
                                    return errcb(null);
                                }
                            },
                            (err) => {
                                console.log(err);
                                return errcb(err);
                            });
                    },
                    function (err) {
                        console.log(err);
                        return errcb(err);
                    }
                );
            });
        });
    }

    public signOut() {
        return new Promise((cb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(null);
                window['plugins'].googleplus.logout(
                    function (msg) {
                        return cb(true);
                    }
                );
            });
        });
    }

    getAuthProfile() {

        let that = this;
        return new Promise<{ email?: string, id_token?: string }>((cb, errcb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(null);
                window['plugins'].googleplus.login(
                    {
                        'scopes': Security.GoogleLoginScopes.join(' '),
                        'webClientId': environment.clientId,
                        'offline': true
                    },
                    function (authprofile) {
                        cb(authprofile);
                    },
                    function (err) {
                        errcb(null);
                    }
                );
            });
        });
    }
}