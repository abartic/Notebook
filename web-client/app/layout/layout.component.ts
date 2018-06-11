import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterEvent, NavigationCancel, NavigationStart, NavigationError, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    public loading = false;
    constructor(public router: Router) {

        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.loading = true;
            }
            if (event instanceof NavigationCancel || event instanceof NavigationError|| event instanceof NavigationEnd) {
                this.loading = false;
            }
        });
    }

    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/dashboard']);
        }
    }

}
