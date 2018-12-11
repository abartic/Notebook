import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { routerTransition } from '../router.animations';
import { NgModule, Injectable, AfterContentInit } from '@angular/core';




@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    animations: [routerTransition()]
})
export class ErrorComponent implements OnInit {


    constructor(private route: ActivatedRoute) {
    }

    error_msg: string;
    ngOnInit() {
        let errorcode = this.route.snapshot.paramMap.get('errorcode');
        if (errorcode === '403')
            this.error_msg = 'Call unverified - CSRF issue!';
        else if (errorcode === '401')
            this.error_msg = 'Unauthorized call';
        else if (errorcode)
            this.error_msg = errorcode;
        else
            this.error_msg = 'Communication/generic issue';
    }

}
