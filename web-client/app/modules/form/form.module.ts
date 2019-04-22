import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { FormComponent } from './form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRoutingModule } from "./form-routing.module";
import { FilterComponent } from './components/filter/filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorComponent } from './components/editor/editor.component';
import { RelationComponent } from './components/relation/relation.component';
import { NgbDateParserFormatter, NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DataResolver } from './services/data-resolver';
import { LoadingModule } from 'ngx-loading';
import { NgbDateFRParserFormatter } from '../../shared/formatters/ngbDateFRParserFormatter';
import { WebDataRocksPivot } from '../../webdatarocks/webdatarocks.angular4';
import { PivotRelationComponent } from './components/pivot-relation/pivot.component';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from 'angular4-multiselect-dropdown/dist/multiselect.component';
import { TagInputModule } from 'ngx-chips';
import { SharedModule } from '../../shared/shared.module';
import { EditEntityDialogWnd } from './components/editEntityDialog/editEntityDialogWnd';
import { SelectEntityDialogWnd } from './components/selectEntityDialog/selectEntityDialogWnd';
import { ReportDialogWnd } from './components/reportDialog/reportDialogWnd';





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
    InfiniteScrollModule,
    NgbDropdownModule
  ],
  declarations: [
    FormComponent,
    FilterComponent,
    EditorComponent,
    RelationComponent,
    WebDataRocksPivot,
    PivotRelationComponent,
    EditEntityDialogWnd,
    SelectEntityDialogWnd,
    ReportDialogWnd,
    
  ],
  providers:[
    DataResolver,
    {provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}
  ],
  entryComponents: [
    
    EditEntityDialogWnd,
    SelectEntityDialogWnd,
    ReportDialogWnd,
  
  ],
})
export class FormModule { }


