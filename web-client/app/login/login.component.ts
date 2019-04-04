import { Component, OnInit, AfterViewInit,  NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AfterContentInit } from '@angular/core';
import { GoogleLoginService } from '../services/google-login-service';
import { UserSessionService } from '../services/userSessionService';
import { UserSession } from '../common/userSession';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

/*cordova*/
//declare var device;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {


    private domain: string;
    userSession: UserSession;
    constructor(private router: Router, 
        private cookieService: CookieService,
        private ngZone: NgZone, 
        private googleLoginService: GoogleLoginService, 
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

        // window['plugins'].googleplus.login(
        //     {
        //         'scopes': 'email ', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        //         //'webClientId': 'client id of the web app/server side', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        //         //'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
        //     },
        //     function (obj) {
        //         alert(JSON.stringify(obj)); // do something useful instead of alerting
        //     },
        //     function (msg) {
        //         alert('error: ' + msg);
        //     }
        // );

        
    }

    continueWithUser()
    {
        this.router.navigate(['/']);
    }


    ngOnInit(): void {
        /*cordova google plus */
        // document.addEventListener('deviceready', function () {
        //     alert(device.platform);
        // }, false);
    }
}
