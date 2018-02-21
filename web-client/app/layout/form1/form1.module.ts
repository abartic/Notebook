

import { Form1Component } from './form1.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fomr1RoutingModule } from "./form1-routing.module";
import { FilterComponent } from './components/filter/filter.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Fomr1RoutingModule
  ],
  declarations: [
    Form1Component,
    FilterComponent
    
  ]
})
export class Form1Module { }


