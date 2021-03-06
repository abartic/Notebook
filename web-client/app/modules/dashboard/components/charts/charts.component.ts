import { BaseEntity } from '../../../../../../server/models/base-entity';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpCallerService } from '../../../../core';



@Component({
    selector: 'dashboard-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss']



})
export class ChartsComponent implements OnInit {
    constructor(private httpCaller: HttpCallerService, private translate: TranslateService) {


    }

    public rows = [];

    public lineChartColors: Array<any> = [
        {
            // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        {
            // dark grey
            backgroundColor: 'rgba(77,83,96,0.2)',
            borderColor: 'rgba(77,83,96,1)',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        {
            // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];

    public lineChartData: Array<any> = [
        

    ];
    public lineChartLabels: Array<any> = [];

    public lineChartOptions: any = {
        responsive: true
    };


    ngOnInit() {
        var dateMinus6Months = new Date(Date.now());
        dateMinus6Months.setMonth(dateMinus6Months.getMonth() - 6);
        this.httpCaller.callPost(
            '/sheetdata/select',
            {
                spreadsheetName: 'movements',
                sheetName: 'documents',
                select: `select month(F), SUM(P) 
                            where L = TRUE AND U = 'SO' AND F > date "` + BaseEntity.dateToStandardDate(dateMinus6Months) + `"
                            group by month(F)
                            order by month(F)
                            label month(F) "month", SUM(P) "value" `,
                addSchema: false
            },
            result => {
                this.rows = result.rows as Array<any>;
                this.lineChartLabels = [];
                this.rows.map(r => this.lineChartLabels.push(r['month'] + 1));
                
                this.translate.get('LBL.6MONTHS_SALES').subscribe(res => {
                    this.lineChartData = [{ data: [], label: res }];
                });

                this.rows.map(r => this.lineChartData[0]['data'].push(r['value']));
            },
            err => {
                this.rows = [];
            });
    }
}
