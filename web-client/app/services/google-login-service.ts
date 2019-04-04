declare const gapi: any;


import { HttpCallerService } from './httpcaller.service';
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Security } from '../../../server/common/security';



@Injectable({
    providedIn: 'root',
})
export class GoogleLoginService {

    private auth2: Promise<gapi.auth2.GoogleAuth> = null;

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
                    let authprofile = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true);
                    let userprofile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
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
                                cb(null);
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

    public isSignedIn() {
        let that = this;
        return new Promise<{ email?: string, id_token?: string }>((cb, errcb) => {
            this.auth2.then(a2 => {
                if (a2 === null)
                    cb(null);

                if (gapi.auth2.getAuthInstance() && gapi.auth2.getAuthInstance().currentUser) {
                    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                        let authprofile = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true);
                        let userprofile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();

                        if (authprofile.access_token && authprofile.access_token.length > 0) {
                            cb({
                                email: userprofile.getEmail(),
                                id_token: authprofile.id_token,
                            });
                        }
                        else{
                            cb(null);
                        }
                    }
                    else
                        cb(null)
                }
                else {
                    cb(null);
                }
            });
        });
    }

    public signOut() {
        return new Promise((cb, errcb) => {
            return this.auth2.then(a2 => {
                if (a2 === null)
                    return cb(false);
                if (gapi.auth2.getAuthInstance())
                    gapi.auth2.getAuthInstance().signOut()
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
}