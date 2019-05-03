import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';


@Component({
    selector: 'app-privacypolicy',
    templateUrl: './privacypolicy.component.html',
    animations: [routerTransition()],
    styleUrls: ['./privacypolicy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
    }

    
}
