import { HttpCallerService } from './../../../services/httpcaller.service';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { CheckLoginService } from '../../../services/check-login-service';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    userSession : UserSession;
    pushRightClass: string = 'push-right';

    constructor(private translate: TranslateService,
        public router: Router,
        private cookieService: CookieService,
        @Inject(CheckLoginService) private checkLogin, 
        @Inject(HttpCallerService) private httpCaller: HttpCallerService) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });
        this.userSession = new UserSession();
    }

    ngOnInit() { 

        this.userSession.Username = this.cookieService.get("userId")
        
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
            () => { },
            () => { });
       
        this.cookieService.delete("google_access_token")
        this.cookieService.delete("google_refresh_token")
        this.cookieService.delete("lastAuthTime")
    }

    changeLang(language: string) {
        this.translate.use(language);
    }
}


export class UserSession {
    public Username : string;
    public Language : string;
}