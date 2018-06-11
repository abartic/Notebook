import { AuthGuard } from './../../shared/guard/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Form1Component } from './form1.component';
import { DataResolver } from './data-resolver';

const routes: Routes = [
  {
    path: '', component: Form1Component, canActivate: [AuthGuard], resolve: {
      packCtrl: DataResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],

})
export class Form1RoutingModule { }
