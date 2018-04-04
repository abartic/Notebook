
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http, HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared';
import { JsonpModule, Jsonp, Response } from '@angular/http';
import { CookieService } from 'ngx-cookie-service';
import { HttpCallerService } from './services/httpcaller.service';


import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

// import { AlertDialogWnd } from './dialog/alertdialog';
// import { AskDialogWnd } from './dialog/askdialog';
// import { EditEntityDialogWnd } from './dialog/editEntityDialog';
// import { SelectEntityDialogWnd } from './dialog/selectEntityDialog';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

// let gapiClientConfig: NgGapiClientConfig = {
//   client_id: "533137817690-qtlt9od45g6l37oj8mts6v6b4feo1he0.apps.googleusercontent.com",
//   discoveryDocs: [],
//   ux_mode : "popup",
//   scope: [
//     'email profile', 'https://www.googleapis.com/auth/spreadsheets.readonly', 'https://spreadsheets.google.com/feeds'
//   ].join(" ")
// };


@NgModule({
  declarations: [
    AppComponent,
    // AlertDialogWnd,
    // AskDialogWnd,
    // EditEntityDialogWnd,
    // SelectEntityDialogWnd
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    JsonpModule,
    NgbModule.forRoot()
    
    // GoogleApiModule.forRoot({
    //   provide: NG_GAPI_CONFIG,
    //   useValue: gapiClientConfig
    // })
  ],
  providers: [
    AuthGuard,
    CookieService,
    HttpCallerService
    

    

  ],
  bootstrap: [AppComponent],
  entryComponents: [
    // AlertDialogWnd,
    // AskDialogWnd,
    // EditEntityDialogWnd,
    // SelectEntityDialogWnd
  ]
})
export class AppModule { }
