
import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Security } from '../../../server/common/security';
import { UserSession } from '../common/userSession';



@Injectable({
    providedIn: 'root',
})
export class GooglePlusLoginService implements IGoogleLogin {

    private auth2 = null;
    constructor(private httpCaller: HttpCallerService) {

        /*cordova google plus */
        console.log('cordova!');
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
        return new Promise<UserSession>((cb, errcb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(null);


                that.httpCaller.callGet('/login/google/getprofile',
                    (p) => {
                        window['plugins'].googleplus.login(
                            {
                                'scopes': Security.GoogleLoginScopes.join(' '),
                                'webClientId': environment.clientId//'client id of the web app/server side', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                                //'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                            },
                            function (authprofile) {
                                alert(JSON.stringify(authprofile));

                                that.httpCaller.callPost('/login/google/success2',
                                    { domainName: domainName, language: p.language, accessToken: authprofile.accessToken, idToken: authprofile.idToken },
                                    (r) => {
                                        if (r && r.refresh === true && cb) {
                                            let us = new UserSession();
                                            us.Username = r.Username;
                                            us.DomainName = r.DomainName;
                                            us.DomainId = r.DomainId;
                                            us.Language = r.Language;
                                            us.LastAuthTime = r.LastAuthTime;
                                            cb(us);
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
                    }, (err) => {
                        return errcb(null);
                    });
            });
        });
    }

    public getUserProfile() {



        let that = this;
        return new Promise<UserSession>((cb, errcb) => {
            this.auth2.then(a2 => {
                console.log(a2)

                if (a2 === null)
                    return cb(null);

                that.httpCaller.callGet('/login/google/getprofile',
                    (p) => {
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
                                that.httpCaller.callPost('/login/google/success2',
                                    { domainName: p.DomainName, language: p.Language, accessToken: authprofile.accessToken, idToken: authprofile.idToken },
                                    (r) => {
                                        console.log(r)
                                        if (r && r.refresh === true && cb) {
                                            let us = new UserSession();
                                            us.Username = r.Username;
                                            us.DomainName = r.DomainName;
                                            us.DomainId = r.DomainId;
                                            us.Language = r.Language;
                                            us.LastAuthTime = r.LastAuthTime;
                                            cb(us);
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

                    }, err => {
                        return errcb(null);
                    });
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

    // getAuthProfile() {

    //     let that = this;
    //     return new Promise<{ email?: string, id_token?: string }>((cb, errcb) => {
    //         this.auth2.then(a2 => {
    //             if (a2 === null)
    //                 return cb(null);
    //             window['plugins'].googleplus.trySilentLogin(
    //                 {
    //                     'scopes': Security.GoogleLoginScopes.join(' '),
    //                     'webClientId': environment.clientId,
    //                     'offline': true
    //                 },
    //                 function (authprofile) {
    //                     cb(authprofile);
    //                 },
    //                 function (err) {
    //                     errcb(null);
    //                 }
    //             );
    //         });
    //     });
    // }
}