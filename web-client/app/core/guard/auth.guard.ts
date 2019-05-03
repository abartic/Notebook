import { Injectable, Inject } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserSessionService } from '../services/userSessionService';
import { UserSession } from '../models/userSession';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class AuthGuard implements CanActivate {

    userSession: UserSession;
    constructor(@Inject(UserSessionService) private userSessionService: UserSessionService,private router: Router) { 

        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {
                this.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }]);
            });
    }

    canActivate() {

        if (environment.mobile === true) {
            return true;
        }
        else 
        {
            let lastAuthTime: string = this.userSession.LastAuthTime;

            if (lastAuthTime !== null) {
                var currentTime = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); //last authentication is older that 30 days 
                var lastLogginTime = new Date(Number.parseInt(lastAuthTime));
                if (lastLogginTime > currentTime)
                    return true;
            }

            this.router.navigate(['/homepage']);
        }

    }
}
