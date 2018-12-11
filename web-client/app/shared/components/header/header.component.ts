import { HttpCallerService } from './../../../services/httpcaller.service';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { CheckLoginService } from '../../../services/check-login-service';

import { UserSessionService } from '../../../services/userSessionService';
import { UserSession } from '../../../common/userSession';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    userSession: UserSession;
    pushRightClass: string = 'push-right';
    navigationSubscription;

    constructor(private translate: TranslateService,
        public router: Router,
        private cookieService: CookieService,
        @Inject(CheckLoginService) private checkLogin,
        @Inject(HttpCallerService) private httpCaller: HttpCallerService,
        @Inject(UserSessionService) private userSessionService: UserSessionService) {
        this.navigationSubscription = this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });

        //console.log(atob(this.cookieService.get("session")));
    }

    ngOnInit() {
        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {
                this.router.navigate(['/error', { errorcode: 'user sessions missing.' }]);
            });
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {

        this.httpCaller.callGet(
            '/logout/google',
            (r) => {
                if (r.response === 'ok') {
                    this.cookieService.delete("google_access_token")
                    this.cookieService.delete("google_refresh_token")
                    this.cookieService.delete("lastAuthTime")
                }
                console.log('logout ' + r.response + '!');
            },
            () => {
                console.log('logout failed!');
            });


    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    ngOnDestroy() {
        // avoid memory leaks here by cleaning up after ourselves. If we  
        // don't then we will continue to run our initialiseInvites()   
        // method on every navigationEnd event.
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }
}


// export class UserSession {
//     public Username : string;
//     public Language : string;
// }