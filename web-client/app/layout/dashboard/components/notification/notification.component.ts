import { Component, OnInit } from '@angular/core';
import { HttpCallerService } from '../../../../services/httpcaller.service';


@Component({
    selector: 'dashboard-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    
})
export class NotificationComponent implements OnInit {
    constructor(private httpCaller: HttpCallerService) { }

    public rows;
    ngOnInit() { 

        this.httpCaller.callPost(
            '/sheetdata/select',
            {

                spreadsheetName: 'movements',
                sheetName: 'art_inventory',
                entityName: 'ArticleInventory',
                select: 'select A, B, SUM(C) group by A, B label A "code_art", B "price_in", SUM(C) "qty"',
                addSchema: false
            },
            result => {
                this.rows = result.rows as Array<any>;

            },
            err => {
                
            });
    }
}
