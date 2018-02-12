import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private cookieService: CookieService) { }

    canActivate() {

        let lastAuthTime: string = this.cookieService.get("lastAuthTime");

        if (lastAuthTime !== null) {
            var currentTime = new Date(Date.now() - 60 * 60 * 24 * 1000); //less 1 day 
            var lastLogginTime = new Date(Number.parseInt(lastAuthTime));
            if (lastLogginTime > currentTime)
                return true;
        }

        this.router.navigate(['/login']);
        return false;

    }
}
