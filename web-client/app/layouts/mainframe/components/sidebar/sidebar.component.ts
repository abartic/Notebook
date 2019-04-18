import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpCallerService } from '../../../../core/services/httpcaller.service';
import { UserSessionService } from '../../../../core/services/userSessionService';
import { TranslateService } from '@ngx-translate/core';
import { UserSession } from '../../../../core/models/userSession';
import { GOOGLE_LOGIN_SERV } from '../../../../core/services/google-login-factory';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

    userSession: UserSession;
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;

    @Output() collapsedEvent = new EventEmitter<boolean>();

    constructor(
        private router: Router,
        private translate: TranslateService,
        @Inject(HttpCallerService) private httpCaller: HttpCallerService,
        @Inject(UserSessionService) private userSessionService: UserSessionService,
        @Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin) {

        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
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
                this.userSession = new UserSession();
                this.userSessionService.updateData(this.userSession)
                that.router.navigate(['/login'])
            })
            .catch(err => {
                console.log(err);
                console.log('logout failed!');
            });
    }



    changeLang(language: string) {
        this.translate.use(language);
        this.userSession.Language = language;
        this.userSessionService.updateData(this.userSession);
    }
}
