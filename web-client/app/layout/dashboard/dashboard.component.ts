import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Http, Jsonp, Response } from '@angular/http';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    

    constructor(private http: Http) {
    
    }

    ngOnInit() {
    }

    
}
