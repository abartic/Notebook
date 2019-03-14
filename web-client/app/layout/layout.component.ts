
import { Component, OnInit, Input, Inject, ViewEncapsulation } from '@angular/core';
import {
    Router, RouterEvent, NavigationCancel, NavigationStart, NavigationError, NavigationEnd,
    ActivatedRoute
} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertDialogWnd } from '../dialog/alertDialog/alertDialogWnd';
import { Observable } from 'rxjs';
import { UserSessionService } from '../services/userSessionService';
import { UserSession } from '../common/userSession';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    public screen_loading = false;
    navigationSubscription;
    userSession: UserSession = new UserSession();


    constructor(public router: Router,
        private activeRoute: ActivatedRoute,
        private modalService: NgbModal,
        @Inject(UserSessionService) private userSessionService: UserSessionService) {

        this.navigationSubscription = router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.userSession.WaitingForAction = true;
            }
            else if (event instanceof NavigationEnd) {
                this.userSession.WaitingForAction = false;
            }
            else if (event instanceof NavigationCancel || event instanceof NavigationError) {
                this.userSession.WaitingForAction = false;
            }


        }, error => {
            this.userSession.WaitingForAction = false;

        }, () => {
            this.userSession.WaitingForAction = false;
        });

    }

    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/dashboard']);
        }


        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {
                this.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }]);
            });

    }

    ngOnDestroy() {
        // avoid memory leaks here by cleaning up after ourselves. If we  
        // don't then we will continue to run our initialiseInvites()   
        // method on every navigationEnd event.
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        // if (this.paramSubscription) {
        //     this.paramSubscription.unsubscribe();
        // }
    }

    collapedSideBar: boolean;
    receiveCollapsed($event) {
        this.collapedSideBar = $event;
    }
}
