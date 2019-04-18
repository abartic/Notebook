
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';



@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',

})
export class MessagesComponent implements OnInit {

    public message;
    constructor(private activatedRoute: ActivatedRoute) {

    }

    ngOnInit() {
        this.message = this.activatedRoute.snapshot.data['message'];
    }

}


