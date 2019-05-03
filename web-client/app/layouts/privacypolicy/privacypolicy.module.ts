import {  TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { PrivacyPolicyRoutingModule } from './privacypolicy-routing.module';
import { PrivacyPolicyComponent } from './privacypolicy.component';




@NgModule({
    imports: [
        CommonModule,
        PrivacyPolicyRoutingModule,
        TranslateModule
        
    ],
    declarations: [
        PrivacyPolicyComponent,
    ]
})
export class PrivacyPolicyModule { }
