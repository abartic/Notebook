


import { Router } from '@angular/router';
import { HttpCallerService } from './httpcaller.service';
import { timer } from 'rxjs/observable/timer';
import { Injectable, Inject } from '@angular/core';
import { UserSessionService } from './userSessionService';
import { UserSession } from '../common/userSession';
import { GOOGLE_LOGIN_SERV } from './google-login-factory';


@Injectable({ providedIn: 'root' })
export class CheckLoginService {

    private timer;
    userSession: UserSession;
    current_access_token;

    constructor(private httpCaller: HttpCallerService,
        private userSessionService: UserSessionService,
        @Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin) {

        let that = this;
        this.userSessionService.userSession.subscribe(
            us => {
                this.userSession = us;
                this.timer = timer(5 * 60 * 1000, 60 * 1000);
                this.timer.subscribe(t => {
                    that.googleLoginService.getUserProfile().then(authprofile => {

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

                });
            },
            error => {
                console.log(error);
            });

    }
}
