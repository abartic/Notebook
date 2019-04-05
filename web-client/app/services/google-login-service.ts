declare const gapi: any;

import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Security } from '../../../server/common/security';



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

    public signIn(domainName) {
        let that = this;
        return new Promise<{ email?: string, id_token?: string, domainName?: string, domainId?: string }>((cb, errcb) => {
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
                    that.httpCaller.callPost('/login/success2', { domainName: domainName, accessToken: authprofile.access_token, idToken: authprofile.id_token },
                        (r) => {
                            if (cb) {
                                cb({
                                    email: userprofile.getEmail(),
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
                        })
                }).catch(err => {
                    if (errcb)
                        errcb(err);
                });
            });
        });

    }

    public isSignedIn(domainName) {
        let that = this;
        return new Promise<{ email?: string, id_token?: string }>((cb, errcb) => {
            this.auth2
                .then(a2 => {
                    if (a2 === null || !a2.currentUser || !a2.currentUser.get().getAuthResponse(true))
                        return cb(null);

                    let authprofile = a2.currentUser.get().getAuthResponse(true);
                    let userprofile = a2.currentUser.get().getBasicProfile();
                    that.httpCaller.callPost('/login/success2', { domainName: domainName, accessToken: authprofile.access_token, idToken: authprofile.id_token },
                        (r) => {
                            if (r && r.refresh === true && cb) {
                                return cb({
                                    email: userprofile.getEmail(),
                                    id_token: authprofile.id_token,
                                });
                            }
                            else {
                                return cb(null);
                            }
                        },
                        (err) => {
                            console.log(err);
                            return cb(null);
                        })
                })
                .catch(err => { errcb(err) });
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

    public getAuthProfile() {
        return new Promise((cb, errcb) => {
            return this.auth2.then(a2 => {
                if (a2 === null || !a2.currentUser)
                    return errcb(null);
                else
                    return cb(a2.currentUser.get().getAuthResponse(true));
            });
        });
    }
}