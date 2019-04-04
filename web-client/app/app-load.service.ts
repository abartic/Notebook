
import { Injectable } from '@angular/core';
import { GoogleLoginService } from './services/google-login-service';
import { UserSessionService } from './services/userSessionService';
import { UserSession } from './common/userSession';




@Injectable({
        providedIn: 'root'
})
export class AppLoadService {
    userSession: UserSession;

    constructor(private googleLoginService: GoogleLoginService, private userSessionService: UserSessionService) {
        let that = this;
        this.userSessionService.userSession.subscribe(us => { that.userSession = us; });
    }

    
    getSettings(): Promise<any> {
        let that = this;
        return this.googleLoginService.isSignedIn()
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