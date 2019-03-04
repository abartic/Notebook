import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { FormComponent } from './form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRoutingModule } from "./form-routing.module";
import { FilterComponent } from './components/filter/filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorComponent } from './components/editor/editor.component';
import { RelationComponent } from './components/relation/relation.component';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DataResolver } from './data-resolver';
import { LoadingModule } from 'ngx-loading';
import { NgbDateFRParserFormatter } from '../../shared/pipes/ngbDateFRParserFormatter';
import { WebDataRocksPivot } from '../../webdatarocks/webdatarocks.angular4';
import { PivotRelationComponent } from './components/pivot-relation/pivot.component';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from 'angular4-multiselect-dropdown/dist/multiselect.component';
import { TagInputModule } from 'ngx-chips';
import { SharedModule } from '../../shared-modules/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormRoutingModule,
    NgbModule,
    LoadingModule,
    TranslateModule,
    AngularMultiSelectModule,
    TagInputModule,
    ReactiveFormsModule,
    SharedModule,
    InfiniteScrollModule
  ],
  declarations: [
    FormComponent,
    FilterComponent,
    EditorComponent,
    RelationComponent,
    WebDataRocksPivot,
    PivotRelationComponent
  ],
  providers:[
    DataResolver,
    {provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}
  ]
})
export class FormModule { }


