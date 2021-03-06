import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    

    constructor(private http: HttpClient) {
    
    }

    ngOnInit() {
    }

    
}
