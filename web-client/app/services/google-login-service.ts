declare const gapi: any;

import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Security } from '../../../server/common/security';
import { UserSession } from '../common/userSession';



@Injectable({ providedIn: 'root' })
export class GoogleLoginService implements IGoogleLogin {



    private auth2 = null //: Promise<gapi.auth2.GoogleAuth> = null;

    constructor(private httpCaller: HttpCallerService) {
        let that = this;

        this.auth2 = new Promise((cb) => {
            gapi.load('auth2', () => {
                let obj = gapi.auth2.init({
                    client_id: environment.clientId,

                });
                cb(obj);

            });
        })
    }

    public signIn(domainName, language) {
        let that = this;
        return new Promise<UserSession>((cb, errcb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(null);

                a2.signIn({
                    prompt: 'select_account',
                    ux_mode: 'popup',
                    scope: Security.GoogleLoginScopes.join(' '),

                }).then(user => {
                    let authprofile = a2.currentUser.get().getAuthResponse(true);
                    let userprofile = a2.currentUser.get().getBasicProfile();
                    that.httpCaller.callPost('/login/google/success2', { domainName: domainName, language: language, accessToken: authprofile.access_token, idToken: authprofile.id_token },
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
                        })
                }).catch(err => {
                    if (errcb)
                        errcb(err);
                });
            });
        });

    }

    public getUserProfile(initCsrf) {
        let that = this;
        return new Promise<UserSession>((cb, errcb) => {
            this.auth2
                .then(a2 => {
                    if (a2 === null || !a2.currentUser || !a2.currentUser.get().getAuthResponse(true))
                        return cb(null);

                    that.httpCaller.callGet('/login/google/init', () => {
                        that.httpCaller.callGet('/login/google/getprofile',
                            (p) => {

                                if (p.error === 'no_profile') {
                                    return cb(null)
                                }
                                else {
                                    let authprofile = a2.currentUser.get().getAuthResponse(true);
                                    let userprofile = a2.currentUser.get().getBasicProfile();
                                    that.httpCaller.callPost('/login/google/success2', { domainName: p.DomainName, language: p.Language, accessToken: authprofile.access_token, idToken: authprofile.id_token },
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
                                                return cb(null);
                                            }
                                        },
                                        (err) => {
                                            console.log(err);
                                            return cb(null);
                                        })
                                }
                            }, (err) => {
                                return cb(null);
                            });
                    }, () => { 
                        cb(null) 
                    });

                })
                .catch(err => { cb(null) });
        });
    }

    public signOut() {
        return new Promise((cb, errcb) => {
            return this.auth2.then(a2 => {
                if (a2 === null || !a2.currentUser || !a2.currentUser.get().getAuthResponse(true))
                    return cb(false);

                a2.signOut()
                    .then(r => {
                        return cb(true);
                    })
                    .catch(
                        err => {
                            errcb(err);
                        });

            });
        });
    }

    // public getAuthProfile() {
    //     return new Promise((cb, errcb) => {
    //         return this.auth2.then(a2 => {
    //             if (a2 === null || !a2.currentUser)
    //                 return errcb(null);
    //             else
    //                 return cb(a2.currentUser.get().getAuthResponse(true));
    //         });
    //     });
    // }
}