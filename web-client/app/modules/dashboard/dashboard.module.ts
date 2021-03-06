import {  TranslateModule } from '@ngx-translate/core';

import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { ChartsComponent } from './components/charts/charts.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    NgbCarouselModule,
    NgbAlertModule
} from '@ng-bootstrap/ng-bootstrap';


import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import {NotificationComponent} from './components';



@NgModule({
    imports: [
        CommonModule,
        Ng2Charts,
        NgbCarouselModule.forRoot(),
        NgbAlertModule.forRoot(),
        DashboardRoutingModule,
        TranslateModule
        
    ],
    declarations: [
        DashboardComponent,
        NotificationComponent,
        ChartsComponent
    ]
})
export class DashboardModule { }
