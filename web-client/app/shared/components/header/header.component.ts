

import { Component, OnInit, Inject, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { UserSessionService } from '../../../services/userSessionService';
import { UserSession } from '../../../common/userSession';
import { GOOGLE_LOGIN_SERV } from '../../../services/google-login-factory';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],

})
export class HeaderComponent implements OnInit {

    userSession: UserSession;
    pushRightClass: string = 'push-right';
    navigationSubscription;

    constructor(private translate: TranslateService,
        public router: Router,
        private cookieService: CookieService,
        @Inject(UserSessionService) private userSessionService: UserSessionService,
        @Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin) {
        this.navigationSubscription = this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });
    }

    ngOnInit() {
        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {
                this.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }]);
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
        let that = this;
        this.googleLoginService.signOut()
            .then(r => {
                console.log('logout ok!');
                this.userSession.Username = '';
                this.userSession.DomainId = '';
                this.userSession.DomainName = '';
                this.userSession.id_token = '';
                this.userSessionService.updateData(this.userSession)
                that.router.navigate(['/login'])
            })
            .catch(err => {
                console.log(err);
                console.log('logout failed!');
            });

        // this.httpCaller.callGet(
        //     '/logout/google',
        //     (r) => {
        //         if (r.response === 'ok') {
        //             this.cookieService.delete("google_access_token")
        //             this.cookieService.delete("google_refresh_token")
        //             this.cookieService.delete("lastAuthTime")
        //         }
        //         console.log('logout ' + r.response + '!');
        //     },
        //     (err) => {
        //         console.log(err);
        //         console.log('logout failed!');
        //     });


    }

    changeLang(language: string) {
        this.translate.use(language);
        this.userSession.Language = language;
        this.cookieService.set("language", language);
        this.userSessionService.updateData(this.userSession);
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
