import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            //     { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
            //     { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
            { path: 'form/partner/:id', loadChildren: './form/form.module#FormModule' },
            { path: 'form/document/:id', loadChildren: './form/form.module#FormModule' },
            { path: 'form/article/:id', loadChildren: './form/form.module#FormModule' },
            { path: 'form/store/:id', loadChildren: './form/form.module#FormModule' },
            { path: 'sheets-creation', loadChildren: './sheets/sheets.module#SheetsModule' },
            //     { path: 'bs-element', loadChildren: './bs-element/bs-element.module#BsElementModule' },
            //     { path: 'grid', loadChildren: './grid/grid.module#GridModule' },
            //     { path: 'components', loadChildren: './bs-component/bs-component.module#BsComponentModule' },
            //     { path: 'blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
