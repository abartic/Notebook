import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpCallerService } from '../../../services/httpcaller.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    constructor(
        @Inject(HttpCallerService) private httpCaller: HttpCallerService,
        private router : Router) {
            
    }


    isActive = false;
    showMenu = '';
    eventCalled() {
        this.isActive = !this.isActive;
    }
    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    ngOnInit() {
        this.onLoadMenu();
    }

    public mainmenu = [];
    onLoadMenu() {

        this.httpCaller.callGet(
            '/login/mainmenu',
            (m) => {
                this.mainmenu = m;
            },
            (error) => {
                if (error && error.status)
                    this.router.navigate(['/error', { errorcode: error.status }]);
                else
                    this.router.navigate(['/error', { errorcode: error }]);
            });


    }

}
