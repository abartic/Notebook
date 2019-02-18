

import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { UserSession } from "../common/userSession";
import { CookieService } from "ngx-cookie-service";

@Injectable()
export class UserSessionService {

    private userSessionDataSource = null;
    userSession = null;

    constructor(cookieService: CookieService) {
        let userSession = new UserSession();
        userSession.Username = cookieService.get("userId");
        userSession.DomainId = cookieService.get("domainId");
        userSession.DomainName = cookieService.get("domainName");
        userSession.Language = cookieService.get("language");
        this.userSessionDataSource = new BehaviorSubject<UserSession>(userSession);
        this.userSession = this.userSessionDataSource.asObservable();
    }



    updatedData(data: UserSession) {
        this.userSessionDataSource.next(data);
    }
}