
import { Injectable, Inject } from '@angular/core';

import { UserSessionService } from './services/userSessionService';
import { UserSession } from './common/userSession';
import { GOOGLE_LOGIN_SERV } from './services/google-login-factory';




@Injectable({
        providedIn: 'root'
})
export class AppLoadService {
    userSession: UserSession;

    constructor(@Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin, private userSessionService: UserSessionService) {
        let that = this;
        this.userSessionService.userSession.subscribe(us => { 
            that.userSession = us; 
        });
    }

    
    getSettings(): Promise<any> {
        let that = this;
        return this.googleLoginService.isSignedIn(that.userSession.DomainName)
            .then(profile => {
                if (profile) {
                    that.userSession.Username = profile.email;
                    that.userSession.id_token = profile.id_token;
                }
                else
                {
                    that.userSession.Username = '';
                    that.userSession.id_token = '';
                }
                that.userSessionService.updateData(that.userSession);
                Promise.resolve(profile);
            });
    }
}