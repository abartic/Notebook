
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SheetsComponent } from './sheets.component';
import { SheetsRoutingModule } from './sheets-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SheetsRoutingModule,
    NgbModule
  ],
  declarations: [
    SheetsComponent,
    
    
  ],
  providers:[
    
    
  ]
})
export class SheetsModule { }


