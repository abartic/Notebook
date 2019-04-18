import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainframeComponent } from './mainframe.component';
import { MessagesComponent } from './components/messages/messages.component';

const routes: Routes = [
    {
        path: '', 
        component: MainframeComponent,
        children: [
            { path: '', loadChildren: '../../modules/dashboard/dashboard.module#DashboardModule' },
            { path: 'dashboard', loadChildren: '../../modules/dashboard/dashboard.module#DashboardModule' },
            { path: 'sheets-creation', loadChildren: '../../modules/sheets/sheets.module#SheetsModule', runGuardsAndResolvers: 'always' },
            { path: 'form/:id', loadChildren: '../../modules/form/form.module#FormModule', runGuardsAndResolvers: 'always'  },
            { path: 'not-found', component: MessagesComponent, data: { message: 'Page not found!' } },
            { path: '**', component: MessagesComponent, data: { message: 'Page not found!' } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainframeRoutingModule { }
