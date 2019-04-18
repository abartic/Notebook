
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core';



const routes: Routes = [
    { path: 'login', loadChildren: './layouts/login/login.module#LoginModule' },
    { path: 'error', loadChildren: './layouts/error/error.module#ErrorModule' },
    { path: '', loadChildren: './layouts/mainframe/mainframe.module#MainframeModule',canActivate: [AuthGuard] },
    
   
];

@NgModule({

    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule],
    })
export class AppRoutingModule { }
