import { Router } from '@angular/router';
import { HttpCallerService } from './httpcaller.service';

import { timer } from 'rxjs/observable/timer';
import { Injectable } from '@angular/core';



@Injectable()
export class CheckLoginService {

    private timer;

    constructor(private httpCaller : HttpCallerService, private router : Router) {
        this.timer = timer(10 * 60 * 1000, 10 * 60 * 1000);
        this.timer.subscribe( t => {

            this.httpCaller.callGet(
                '/login/google/refresh',
                result => {
                    console.log(result);
                    if (result.refresh === false)
                        this.router.navigate(['/login']);
                },
                err => {
                    console.log(err);
                    this.router.navigate(['/login']);
                });
        });
    }

    

}
