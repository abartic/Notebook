import { ChartsModule } from 'ng2-charts/ng2-charts';
import { LoadingModule } from 'ngx-loading';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent, SidebarComponent } from '../shared';
import { MessagesComponent } from '../shared/components/messages/messages.component';



@NgModule({
    imports: [
        CommonModule,
        LoadingModule,
        LayoutRoutingModule,
        NgbDropdownModule,
        TranslateModule,
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        MessagesComponent,

    ]
})
export class LayoutModule { }
