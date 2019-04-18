
import { Component, OnInit, Input, Inject, ViewEncapsulation } from '@angular/core';
import { Router, NavigationCancel, NavigationStart, NavigationError, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserSessionService } from '../../core/services/userSessionService';
import { UserSession } from '../../core/models/userSession';


@Component({
    selector: 'app-mainframe',
    templateUrl: './mainframe.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./mainframe.component.scss']

})
export class MainframeComponent implements OnInit {


    navigationSubscription;
    userSession: UserSession = new UserSession();


    constructor(public router: Router,
        private activeRoute: ActivatedRoute,
        private modalService: NgbModal,
        @Inject(UserSessionService) private userSessionService: UserSessionService) {

        let that = this;
        this.navigationSubscription = router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                that.userSession.WaitingForAction = true;
            }
            else if (event instanceof NavigationEnd) {
                that.userSession.WaitingForAction = false;
                window.scrollTo(0, 0);
            }
            else if (event instanceof NavigationCancel || event instanceof NavigationError) {
                that.userSession.WaitingForAction = false;
            }


        }, error => {
            that.userSession.WaitingForAction = false;

        }, () => {
            that.userSession.WaitingForAction = false;
        });

    }

    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/dashboard']);
        }

        let that = this;
        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {
                that.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }]);
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
