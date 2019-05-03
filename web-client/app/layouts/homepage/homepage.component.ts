import { HttpClient } from '@angular/common/http';
import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserSessionService } from '../../core/services/userSessionService';
import { UserSession } from '../../core';


@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    animations: [routerTransition()]
})
export class HomepageComponent implements OnInit {
    
    userSession: UserSession = new UserSession();
    
    constructor(public router: Router,
        private activeRoute: ActivatedRoute,
        private modalService: NgbModal,
        private ngZone: NgZone,
        @Inject(UserSessionService) private userSessionService: UserSessionService) {
    
    }

    ngOnInit() {

        let that = this;
        // this.userSessionService.userSession.subscribe(
        //     us => {
        //         that.userSession = us;
        //         if (that.userSession.DomainId) {
        //             that.ngZone.run(() => that.router.navigate(['/dashboard'])
        //                 .then()
        //                 .catch(err => console.log(err)));
        //         }
                
        //     },
        //     error => {


        //         // that.ngZone.run(() => that.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }])
        //         //     .then()
        //         //     .catch(err => console.log(err)));
        //     });

    }

    
}
