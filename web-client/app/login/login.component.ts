import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { UserSessionService } from '../services/userSessionService';
import { UserSession } from '../common/userSession';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { GOOGLE_LOGIN_SERV } from '../services/google-login-factory';



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {


    domain: string;
    userSession: UserSession;
    constructor(private router: Router,
        private cookieService: CookieService,
        private ngZone: NgZone,
        @Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin,
        private userSessionService: UserSessionService,
        private translate: TranslateService) {
        let that = this;
        this.userSessionService.userSession.subscribe(us => { that.userSession = us; });
    }



    signInWithGoogle(): void {

        /*old login*/
        //window.open(environment.baseUrlServices + "/login/google/domain/" + this.domain, "_self");
        let that = this;
        this.googleLoginService.signIn(this.domain)
            .then(
                (profile) => {

                    that.userSession.Username = profile.email;
                    that.userSession.id_token = profile.id_token;
                    that.userSession.DomainName = profile.domainName;
                    that.userSession.DomainId = profile.domainId;
                    const browserLang = that.translate.getBrowserLang();
                    that.userSession.Language = that.cookieService.get("language") || (browserLang.match(/en|ro/) ? browserLang : 'en');
                    this.ngZone.run(() => this.router.navigate(['/'])).then();
                }
            ).catch(err => {
                console.log(err);
            });
    }

    continueWithUser() {
        this.router.navigate(['/']);
    }


    ngOnInit(): void {
       
    }
}
