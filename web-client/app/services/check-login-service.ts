import { HttpCallerService } from './httpcaller.service';

import { timer } from 'rxjs/observable/timer';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';


@Injectable()
export class CheckLoginService {

    private timer;

    constructor(private httpCaller : HttpCallerService) {
        this.timer = timer(15 * 60 * 1000, 15 * 60 * 1000);
        this.timer.subscribe( t => {

            this.httpCaller.callGet(
                '/login/google/refresh',
                result => {
                    console.log(result);
                },
                err => {
                    console.log(err);
                });
        });
    }

    

}
