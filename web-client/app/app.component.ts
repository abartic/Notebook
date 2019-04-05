
import { Component, OnInit, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserSessionService } from './services/userSessionService';
import { UserSession } from './common/userSession';
import { Router } from '@angular/router';
import { CheckLoginService } from './services/check-login-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit {

  userSession: UserSession;

  constructor(private translate: TranslateService,
    private userSessionService: UserSessionService,
    private checkLoginService: CheckLoginService, 
    private router: Router, 
    private ngZone: NgZone) {

    this.translate.addLangs(['en', 'ro']);
    this.translate.setDefaultLang('en');


  }

  ngOnInit() {
    let that = this;
    this.userSessionService.userSession.subscribe(us => {
      that.userSession = us;
      
      if (that.userSession.Username.length === 0 || that.userSession.id_token.length === 0)
      {
        this.ngZone.run(() => this.router.navigate(['/login'])).then();
      }
      else
      {
        that.translate.use(that.userSession.Language);
      }


    });
  }


}




