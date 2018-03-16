import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { NgModule, Injectable, AfterContentInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Http, Jsonp, Response } from '@angular/http';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms'

import { CookieService } from 'ngx-cookie-service';



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
        private http: Http,
        private jsonp: Jsonp,

        private cookieService: CookieService) {

    }


    signInWithGoogle(): void {

        window.open("/login/google", "_self");

        //this.authService.signIn();
        // let dialogRef = this.dialog.open(LoginDialog, { data: 
        //     { source_page : '/login/google' }
        // });
        // dialogRef.afterClosed().subscribe(result => {
        //     var r = result;
        // });

    }

    ngAfterContentInit() {
        let token = this.cookieService.get("google_access_token");
        let lastAuthTime = this.cookieService.get("lastAuthTime");

        if (lastAuthTime !== null && token !== undefined)
            return;
        else
            this.router.navigate(['/dashboard']);

    }

    //cookieValue = 'UNKNOWN';
    ngOnInit() {



        // this.authService.authState.subscribe((user) => {
        //     this.user = user;
        //     if (user === null || localStorage.getItem('pendingAuthentication') == null)
        //         return;

        //     localStorage.removeItem('pendingAuthentication');
        //     if (user.provider === "GOOGLE")
        //         this.checkAuthentication('google');
        //     else
        //         this.checkAuthentication('facebook');
        // });
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
