import { Component, Inject, OnInit } from '@angular/core';
import { Router } from 'express';
import { HttpCallerService } from '../../../services/httpcaller.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    constructor(
        @Inject(HttpCallerService) private httpCaller: HttpCallerService)
    {

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

    private mainmenu = [];
    onLoadMenu() {

        this.httpCaller.callGet(
            '/login/mainmenu',
            (m) => {
              this.mainmenu = m; 
            },
            () => {
               
             });


    }

}
