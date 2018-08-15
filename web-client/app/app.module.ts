import { DateUserFormatPipe } from './shared/pipes/shared-pipes.module';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { LoadingModule } from 'ngx-loading';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { Http, HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard, SharedModule } from './shared';
//import { JsonpModule } from '@angular/http';
import { CookieService } from 'ngx-cookie-service';
import { HttpCallerService } from './services/httpcaller.service';


import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AlertDialogWnd } from './dialog/alertDialog/alertDialogWnd';
import { AskDialogWnd } from './dialog/askDialog/askDialogWnd';
import { EditEntityDialogWnd } from './dialog/editEntityDialog/editEntityDialogWnd';
import { SelectEntityDialogWnd } from './dialog/selectEntityDialog/selectEntityDialogWnd';
import { CheckLoginService } from './services/check-login-service';
import { CommonModule } from '@angular/common';
import { SafePipe } from './shared/pipes/safeurl';
import { ReportDialogWnd } from './dialog/reportDialog/reportDialogWnd';

import {Location, HashLocationStrategy, LocationStrategy} from '@angular/common'
import { Routes, RouterModule } from '@angular/router';

//import { LoginComponent } from './login/login.component';
// AoT requires an exported function for factories
// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
// }

export const createTranslateLoader = (http: HttpClient) => {
  /* for development
  return new TranslateHttpLoader(
      http,
      '/start-angular/SB-Admin-BS4-Angular-6/master/dist/assets/i18n/',
      '.json'
  ); */
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};

// let gapiClientConfig: NgGapiClientConfig = {
//   client_id: "533137817690-qtlt9od45g6l37oj8mts6v6b4feo1he0.apps.googleusercontent.com",
//   discoveryDocs: [],
//   ux_mode : "popup",
//   scope: [
//     'email profile', 'https://www.googleapis.com/auth/spreadsheets.readonly', 'https://spreadsheets.google.com/feeds'
//   ].join(" ")
// };

// const appRoutes: Routes = [

//   { path: 'login1', component: LoginComponent },
// ];

@NgModule({
  declarations: [
    AppComponent,
    AlertDialogWnd,
    AskDialogWnd,
    EditEntityDialogWnd,
    SelectEntityDialogWnd,
    ReportDialogWnd,
    SafePipe,
    
    
  ],
  imports: [
    //RouterModule.forRoot(appRoutes),
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    
    //HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
      }
  }),
    AppRoutingModule,
    
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: HttpLoaderFactory,
    //     deps: [Http]
    //   }
    // }),

    LoadingModule,
    //JsonpModule,
    SharedModule,
    NgbModule.forRoot()
    
    // GoogleApiModule.forRoot({
    //   provide: NG_GAPI_CONFIG,
    //   useValue: gapiClientConfig
    // })
  ],
  providers: [
    AuthGuard,
    CookieService,
    HttpCallerService,
    CheckLoginService,
   //Location, 
    //{provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AlertDialogWnd,
    AskDialogWnd,
    EditEntityDialogWnd,
    SelectEntityDialogWnd,
    ReportDialogWnd
    
  ],
  exports : [
    
  ]
  
})
export class AppModule { }
