import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { MessagesComponent } from '../shared/components/messages/messages.component';

const routes: Routes = [
    {
        path: '', 
        component: LayoutComponent,
        children: [
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            { path: 'sheets-creation', loadChildren: './sheets/sheets.module#SheetsModule', runGuardsAndResolvers: 'always' },
            { path: 'form/:id', loadChildren: './form/form.module#FormModule', runGuardsAndResolvers: 'always'  },
            { path: 'not-found', component: MessagesComponent, data: { message: 'Page not found!' } },
            { path: '**', component: MessagesComponent, data: { message: 'Page not found!' } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
