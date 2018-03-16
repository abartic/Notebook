
import { Form1Component } from './form1.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form1RoutingModule } from "./form1-routing.module";
import { FilterComponent } from './components/filter/filter.component';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './components/editor/editor.component';
import { RelationComponent } from './components/relation/relation.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Form1RoutingModule
  ],
  declarations: [
    Form1Component,
    FilterComponent,
    EditorComponent,
    RelationComponent
    
  ],
  providers:[
    //{provide:'Partner', useFactory:()=>(new Package<Partner>(Partner))},
    
  ]
})
export class Form1Module { }


