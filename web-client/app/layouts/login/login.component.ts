import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../../router.animations';
import { UserSessionService } from '../../core/services/userSessionService';
import { UserSession } from '../../core/models/userSession';
import { GOOGLE_LOGIN_SERV } from '../../core/services/google-login-factory';
import { TranslateService } from '@ngx-translate/core';



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
        @Inject(GOOGLE_LOGIN_SERV) private googleLoginService: IGoogleLogin,
        private userSessionService: UserSessionService,
        private ngZone: NgZone,
        private translateService: TranslateService) {
        let that = this;
        this.userSessionService.userSession.subscribe(us => { that.userSession = us; });
    }

    signInWithGoogle(): void {

        /*old login*/
        //window.open(environment.baseUrlServices + "/login/google/domain/" + this.domain, "_self");
        let that = this;
        this.googleLoginService.signIn(this.domain, this.language)
            .then(
                (profile) => {

                    that.userSession.Username = profile.Username;
                    that.userSession.DomainName = profile.DomainName;
                    that.userSession.DomainId = profile.DomainId;
                    that.userSession.Language = profile.Language;
                    that.userSession.LastAuthTime = profile.LastAuthTime;
                    that.userSessionService.updateData(that.userSession);
                    that.ngZone.run(() => that.router.navigate(['/'])).then().catch(err=>console.log(err));
                }
            ).catch(err => {
                console.log(err);
                if (err && err == "domnain-missing")
                    alert(this.translateService.instant("MSG.DOMAIN_MISSING")); //'Domain missing or suspended!')
                else
                    alert(this.translateService.instant("MSG.LOGIN_ERROR")); //'Login error! Retry.')
            });
    }

    continueWithUser() {
        this.router.navigate(['/']);
    }


    ngOnInit(): void {
       this.domain = this.userSession.DomainName;
       this.language = this.userSession.Language;
    }

    language = 'en';
    setLang(language)
    {
        this.language =language;
    }
}