
import { BehaviorSubject, Observable } from "rxjs";
import { UserSession } from "../models/userSession";
import { Injectable } from '@angular/core';

@Injectable({
        providedIn: 'root'
})
export class UserSessionService {

    private userSessionDataSource : BehaviorSubject<UserSession> = null;
    userSession : Observable<UserSession> = null;

    constructor() {
        let userSession = new UserSession();
        this.userSessionDataSource = new BehaviorSubject<UserSession>(userSession);
        this.userSession = this.userSessionDataSource.asObservable();
    }



    public updateData(data: UserSession) {
        this.userSessionDataSource.next(data);
    }
}