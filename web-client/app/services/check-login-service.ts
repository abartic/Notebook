import { Router } from '@angular/router';
import { HttpCallerService } from './httpcaller.service';

import { timer } from 'rxjs/observable/timer';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserSessionService } from './userSessionService';
import { UserSession } from '../common/userSession';
import { GoogleAuthService } from "ng-gapi";



@Injectable({
    providedIn: 'root'
})
export class CheckLoginService {

    private timer;
    userSession: UserSession;
    current_access_token;

    constructor(private httpCaller: HttpCallerService, private router: Router, private userSessionService: UserSessionService) {

        let that = this;
        this.userSessionService.userSession.subscribe(
            us => {
                this.userSession = us;
                this.timer = timer(5 * 60 * 1000, 60 * 1000);
                this.timer.subscribe(t => {
                    let authprofile = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse();
                    if (that.current_access_token !== authprofile.access_token) {
                        that.current_access_token = authprofile.access_token;
                        that.httpCaller.callPost('/login/success2', 
                            { 
                                domainName: that.userSession.DomainName, 
                                accessToken: authprofile.access_token, 
                                idToken: authprofile.id_token
                            },
                            (r) => {

                                console.log(r);
                            },
                            (err) => {
                                console.log(err);
                            });
                    }

                    // this.httpCaller.callGet(
                    //     '/login/google/refresh',
                    //     result => {
                    //         console.log(result);
                    //         if (result.refresh === false)
                    //             this.router.navigate(['/login']);
                    //     },
                    //     err => {
                    //         console.log(err);
                    //         this.router.navigate(['/login']);
                    //     });
                });
            },
            error => {

            });



    }



}
