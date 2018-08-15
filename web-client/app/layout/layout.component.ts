import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterEvent, NavigationCancel, NavigationStart, NavigationError, NavigationEnd, 
    ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertDialogWnd } from '../dialog/alertDialog/alertDialogWnd';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    public screen_loading = false;
    navigationSubscription;
    //paramSubscription;

    constructor(public router: Router, private activeRoute: ActivatedRoute, private modalService: NgbModal) {
        this.navigationSubscription = router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.screen_loading = true;
            }
            else if (event instanceof NavigationEnd) {
                this.screen_loading = false;
                this.initialiseInvites();
            }
            else if (event instanceof NavigationCancel || event instanceof NavigationError) {
                this.screen_loading = false;
            }

        }, error => {
            this.screen_loading = false;
        }, () => {
            this.screen_loading = false;
        });
        // this.paramSubscription = this.activeRoute.params.subscribe(params => {
            
        // });
    }

    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/dashboard']);
        }
        // else{
        //     let param = this.activeRoute.snapshot.paramMap.get('value');
        //     if (param === 'route-error')
        //     {
        //         console.log('error');
        //     }
        // }
    }

    initialiseInvites() {
        // Set default values and re-fetch any data you need.
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

}
