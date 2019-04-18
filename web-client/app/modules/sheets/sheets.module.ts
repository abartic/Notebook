
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SheetsComponent } from './sheets.component';
import { SheetsRoutingModule } from './sheets-routing.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SheetsRoutingModule,
    NgbDropdownModule,
    TranslateModule,
  ],
  declarations: [
    SheetsComponent,
    
    
  ],
  providers:[
    
    
  ]
})
export class SheetsModule { }


