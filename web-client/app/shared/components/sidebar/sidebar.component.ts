import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpCallerService } from '../../../services/httpcaller.service';
import { CookieService } from 'ngx-cookie-service';
import { CheckLoginService } from '../../../services/check-login-service';
import { UserSessionService } from '../../../services/userSessionService';
import { TranslateService } from '@ngx-translate/core';
import { UserSession } from '../../../common/userSession';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    userSession: UserSession;
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;
    
    @Output() collapsedEvent = new EventEmitter<boolean>();
    
    constructor(
        private router : Router,
        private cookieService: CookieService,
        private translate: TranslateService,
        @Inject(HttpCallerService) private httpCaller: HttpCallerService,
        @Inject(CheckLoginService) private checkLogin,
        @Inject(UserSessionService) private userSessionService: UserSessionService) {
    }
  
    eventCalled() {
        this.isActive = !this.isActive;
    }
    
    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    ngOnInit() {
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
        this.pushRightClass = 'push-right';
        this.onLoadMenu();
        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {
                this.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }]);
            });
    }

    public mainmenu = [];
    onLoadMenu() {

        this.httpCaller.callGet(
            '/login/mainmenu',
            (m) => {
                this.mainmenu = m;
            },
            (error) => {
                    this.router.navigate(['/login']);
            });


    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsedEvent.emit(this.collapsed);
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
        this.userSession.Language = language;
        this.cookieService.set("language",language);
    }
}
