
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared';
import { MessagesComponent } from './shared/components/messages/messages.component';

const routes: Routes = [
    { path: 'login', loadChildren: './login/login.module#LoginModule' },
    { path: 'error', loadChildren: './error/error.module#ErrorModule' },
    { path: '', loadChildren: './layout/layout.module#LayoutModule',canActivate: [AuthGuard] },
    //{ path: 'message/:value', component: MessagesComponent , runGuardsAndResolvers: 'always' },
   
];

@NgModule({

    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule],
    })
export class AppRoutingModule { }
