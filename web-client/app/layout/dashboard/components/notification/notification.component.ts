import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpCallerService } from '../../../../services/httpcaller.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'dashboard-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],

})
export class NotificationComponent implements OnInit {
    constructor(private httpCaller: HttpCallerService,private translate: TranslateService) { }

    @ViewChild('rootdiv') rootdiv: ElementRef;

    public screensize: string;


    public rows = [];
    ngOnInit() {

        const style = window.getComputedStyle(this.rootdiv.nativeElement);
        this.screensize = style.getPropertyValue('--screensize');


        this.httpCaller.callPost(
            '/sheetdata/select',
            {

                spreadsheetName: 'movements',
                sheetName: 'art_inventory',
                entityName: 'ArticleInventory',
                select: 'select A, B, SUM(C), SUM(D) group by A, B label A "code_art", B "code_store", SUM(C) "qty_in", SUM(D) "qty_out"',
                addSchema: false
            },
            result => {
                this.rows = result.rows as Array<any>;

            },
            err => {
                this.rows = [];
            });
    }




    onResize(event) {
        const style = window.getComputedStyle(this.rootdiv.nativeElement);
        this.screensize = style.getPropertyValue('--screensize');
    }

    isSmallSizeScreen() {
        return (this.screensize || '').trim() === 'sm';
    }
}
