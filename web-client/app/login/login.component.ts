import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { NgModule, Injectable, AfterContentInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms'

import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';




declare var jquery: any;
declare var $: any;


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit, AfterContentInit {


    constructor(public router: Router,
        private http: HttpClient,
        private cookieService: CookieService) {
    }


    signInWithGoogle(): void {

        window.open("/login/google", "_self");
    }

    ngAfterContentInit() {
        let token = this.cookieService.get("google_access_token");
        let lastAuthTime = this.cookieService.get("lastAuthTime");

        if (lastAuthTime !== null && token !== undefined)
            return;
        else
            this.router.navigate(['/dashboard']);

    }


    ngOnInit() {

    }


    checkAuthentication(provider: String) {
        // let url = '/login/' + provider + '/?callback=JSONP_CALLBACK';
        // this.jsonp.get(url)
        //     // .error(error => {

        //     //      return Observable.of('Server error');
        //     // })
        //     .subscribe((res: Response) => {
        //         var response = res.json();

        //         //localStorage.setItem('fbk_access_token', response['fbk_access_token']);

        //         this.router.navigate(['/dashboard']);
        //     });


        // this.http
        //     .post('checkAuthorization', {'resource': '/'}, null)
        //     .subscribe(r => {
        //         var response = r.json();
        //         if (response.isAuthorized == true)
        //         {
        //             localStorage.setItem('isLoggedin', 'true'); 
        //             this.router.navigate(['/dashboard']); 
        //         }
        //     });
        // this.http
        //     .get('/login/facebook')
        //     .subscribe(resp => {
        //         console.log(resp);
        //     });





    }
}
