
import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../../environments/environment';
import { Security } from '../../../../server/common/security';
import { UserSession } from '../models/userSession';



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
            document.addEventListener("backbutton", function () {
                // Handle the back button
            }, false);

            document.addEventListener("resume", function () {
                console.log('app activated...');
                that.getUserProfile(false);
            }, false);

            document.addEventListener('deviceready', function () {
                console.log('Device is ready!');

                that.httpCaller.callGetAsText('/login/google/init',
                    () => {
                        console.log(window['cookieMaster']);
                        window['cookieMaster'].getCookieValue(environment.baseUrlServices, 'xsrf-token', function (data) {
                            console.log(data.cookieValue);
                            environment['xsrf_token'] = data.cookieValue;
                            cb(true);
                        }, function (error) {
                            if (error) {
                                console.log('error: ' + error);
                            }
                            cb(null);
                        });
                    });
            }, false);
        });
    }

    public signIn(domainName, language) {
        let that = this;
        return new Promise<UserSession>((cb, errcb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(null);

                window['plugins'].googleplus.login(
                    {
                        'scopes': Security.GoogleLoginScopes.join(' '),
                        'webClientId': environment.clientId,
                        'offline': false
                    },
                    function (authprofile) {

                        that.httpCaller.callPost('/login/google/success2',
                            { domainName: domainName, language: language, accessToken: authprofile.accessToken, idToken: authprofile.idToken },
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
                        errcb(err);
                    }
                );

            });
        });
    }

    public getUserProfile(initCsrf) {
        let that = this;
        return new Promise<UserSession>((cb, errcb) => {
            this.auth2.then(a2 => {
                console.log(a2)

                if (a2 === null)
                    return cb(null);

                that.httpCaller.callGet('/login/google/getprofile',
                    (p) => {

                        if (p.error === 'no_profile') {
                            return cb(null);
                        }
                        else {

                            let setlogin = function (accessToken, idToken) {
                                that.httpCaller.callPost('/login/google/success2',
                                    { domainName: p.DomainName, language: p.Language, accessToken: accessToken, idToken: idToken },
                                    (r) => {
                                        console.log(r)
                                        if (r && r.refresh === true && cb) {
                                            let us = new UserSession();
                                            us.Username = r.Username;
                                            us.DomainName = r.DomainName;
                                            us.DomainId = r.DomainId;
                                            us.Language = r.Language;
                                            us.LastAuthTime = r.LastAuthTime;
                                            return cb(us);
                                        }
                                        else {
                                            return cb(null);
                                        }
                                    },
                                    (err) => {
                                        console.log(err);
                                        return cb(err);
                                    });
                            }

                            window['cookieMaster'].getCookieValue(environment.baseUrlServices, 'xsrf-token', function (data) {

                                //read csrf cookie to be added to http header
                                console.log(data.cookieValue);
                                environment['xsrf_token'] = data.cookieValue;

                                window['plugins'].googleplus.trySilentLogin(
                                    {
                                        'scopes': Security.GoogleLoginScopes.join(' '),
                                        'webClientId': environment.clientId,
                                        'offline': false
                                    },
                                    function (authprofile) {
                                        console.log(authprofile);
                                        setlogin(authprofile.accessToken, authprofile.idToken);
                                    },
                                    function (err) {
                                        console.log(err);
                                        return cb(null);
                                    }
                                );

                            }, function (error) {
                                cb(null);
                            });

                        }
                    }, err => {
                        return cb(null);
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