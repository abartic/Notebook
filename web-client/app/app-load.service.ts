
import { Injectable, Inject } from '@angular/core';

import { UserSessionService } from './core/services/userSessionService';
import { UserSession } from './core/models/userSession';
import { GOOGLE_LOGIN_SERV } from './core/services/google-login-factory';




@Injectable({
        providedIn: 'root'
})
export class AppLoadService {
    userSession: UserSession;

    constructor(
        private userSessionService: UserSessionService, 
        @Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin) 
    {
        let that = this;
        this.userSessionService.userSession.subscribe(us => { 
            that.userSession = us; 
        });
    }

    
    getSettings(): Promise<any> {
        let that = this;
        
        return this.googleLoginService.getUserProfile(true)
            .then(profile => {
                if (profile) {
                    that.userSession = profile;
                }
                else
                {
                    that.userSession = new UserSession();
                }
                that.userSessionService.updateData(that.userSession);
                Promise.resolve(profile);
            });
    }
}