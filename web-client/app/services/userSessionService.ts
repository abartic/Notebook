
import { BehaviorSubject, Observable } from "rxjs";
import { UserSession } from "../common/userSession";
import { CookieService } from "ngx-cookie-service";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
        providedIn: 'root'
})
export class UserSessionService {

    private userSessionDataSource : BehaviorSubject<UserSession> = null;
    userSession : Observable<UserSession> = null;

    constructor(private cookieService: CookieService, private translate: TranslateService) {
        let userSession = new UserSession();
        userSession.Username = cookieService.get("userId");
        userSession.DomainId = cookieService.get("domainId");
        userSession.DomainName = cookieService.get("domainName");
        const browserLang = translate.getBrowserLang();
        userSession.Language = this.cookieService.get("language") || (browserLang.match(/en|ro/) ? browserLang : 'en');
        this.userSessionDataSource = new BehaviorSubject<UserSession>(userSession);
        this.userSession = this.userSessionDataSource.asObservable();
    }



    public updateData(data: UserSession) {
        this.userSessionDataSource.next(data);
    }
}