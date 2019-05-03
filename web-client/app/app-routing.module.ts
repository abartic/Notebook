
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';




const routes: Routes = [
    { path: 'login', loadChildren: './layouts/login/login.module#LoginModule' },
    { path: 'error', loadChildren: './layouts/error/error.module#ErrorModule' },
    { path: 'homepage', loadChildren: './layouts/homepage/homepage.module#HomepageModule' },
    { path: 'privacypolicy', loadChildren: './layouts/privacypolicy/privacypolicy.module#PrivacyPolicyModule' },
    { path: '', loadChildren: './layouts/mainframe/mainframe.module#MainframeModule' },
    // { path: '', loadChildren: './layouts/homepage/homepage.module#HomepageModule' },
       
];

@NgModule({

    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule],
    })
export class AppRoutingModule { }
