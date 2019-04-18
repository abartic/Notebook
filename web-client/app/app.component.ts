
import { Component, OnInit, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserSessionService } from './core/services/userSessionService';
import { UserSession } from './core/models/userSession';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit {

  userSession: UserSession;

  constructor(private translate: TranslateService,
    private userSessionService: UserSessionService,
    private router: Router,
    private ngZone: NgZone) {

    this.translate.addLangs(['en', 'ro']);
    this.translate.setDefaultLang('en');


  }

  ngOnInit() {


    let that = this;
    this.userSessionService.userSession.subscribe(us => {
      that.userSession = us;

      if (!that.userSession.Username) {
        this.ngZone.run(() => this.router.navigate(['/login'])).then();
      }
      else {
        that.translate.use(that.userSession.Language);
        if (environment.mobile === true) {
          this.ngZone.run(() => this.router.navigate(['/'])).then();
        }
      }


    });
  }


}




