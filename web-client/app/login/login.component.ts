import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { UserSessionService } from '../services/userSessionService';
import { UserSession } from '../common/userSession';
import { GOOGLE_LOGIN_SERV } from '../services/google-login-factory';
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
        private translate: TranslateService) {
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
                    this.ngZone.run(() => this.router.navigate(['/'])).then().catch(err=>console.log(err));
                }
            ).catch(err => {
                console.log(err);
                alert('Login error! Retry.')
            });
    }

    continueWithUser() {
        this.router.navigate(['/']);
    }


    ngOnInit(): void {
       
    }

    language = 'en';
    setLang(language)
    {
        this.language =language;
    }
}