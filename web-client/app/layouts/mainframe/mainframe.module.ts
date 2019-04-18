
import { LoadingModule } from 'ngx-loading';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core';

import { MainframeRoutingModule } from './mainframe-routing.module';
import { MainframeComponent } from './mainframe.component';

import { MessagesComponent } from './components/messages/messages.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';




@NgModule({
    imports: [
        CommonModule,
        LoadingModule,
        MainframeRoutingModule,
        NgbModule,
        NgbDropdownModule,
        TranslateModule,
    ],
    
    declarations: [
        MainframeComponent,
        HeaderComponent,
        SidebarComponent,
        MessagesComponent,

    ]
})
export class MainframeModule { }
