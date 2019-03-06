import { AuthGuard } from './../../shared/guard/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SheetsComponent } from './sheets.component';


const routes: Routes = [
    { path: '', component: SheetsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SheetsRoutingModule { }
