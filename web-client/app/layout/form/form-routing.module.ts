import { AuthGuard } from './../../shared/guard/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form.component';
import { DataResolver } from './data-resolver';

const routes: Routes = [
  {
    path: '', component: FormComponent, canActivate: [AuthGuard], resolve: {
      packCtrl: DataResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],

})
export class FormRoutingModule { }
