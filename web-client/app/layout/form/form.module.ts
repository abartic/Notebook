
import { FormComponent } from './form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRoutingModule } from "./form-routing.module";
import { FilterComponent } from './components/filter/filter.component';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './components/editor/editor.component';
import { RelationComponent } from './components/relation/relation.component';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DataResolver } from './data-resolver';
import { LoadingModule } from 'ngx-loading';
import { NgbDateFRParserFormatter } from '../../shared/pipes/ngbDateFRParserFormatter';
import { SharedModule } from '../../shared/index';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormRoutingModule,
    NgbModule,
    LoadingModule,
    SharedModule,
  ],
  declarations: [
    FormComponent,
    FilterComponent,
    EditorComponent,
    RelationComponent
    
  ],
  providers:[
    //{provide:'Partner', useFactory:()=>(new Package<Partner>(Partner))},
    DataResolver,
    {provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}
  ]
})
export class FormModule { }


