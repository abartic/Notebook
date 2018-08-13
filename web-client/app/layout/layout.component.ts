import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterEvent, NavigationCancel, NavigationStart, NavigationError, NavigationEnd } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertDialogWnd } from '../dialog/alertDialog/alertDialogWnd';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    public screen_loading = false;
    constructor(public router: Router, private modalService: NgbModal) {

        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.screen_loading = true;
            }
            else if (event instanceof NavigationEnd
                || event instanceof NavigationCancel || event instanceof NavigationError) {
                this.screen_loading = false;
            }

        }, error => {
            this.screen_loading = false;
        }, () => {
            this.screen_loading = false;
        });
    }

    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/dashboard']);
        }
    }

}
