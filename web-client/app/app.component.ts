import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserSessionService } from './services/userSessionService';
import { UserSession } from './common/userSession';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {



  constructor(private router: Router,
    
    private translate: TranslateService,
    private userSessionService: UserSessionService) {

    translate.addLangs(['en', 'ro']);
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|ro/) ? browserLang : 'en');

  }

  ngOnInit() {
    
  }
}




