import { LoginDialog } from './login/login.dialog';
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
import { MatDialogModule } from "@angular/material";






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
    LoginDialog
    
    
  ],
  entryComponents: [
    LoginDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
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
    MatDialogModule,
    // GoogleApiModule.forRoot({
    //   provide: NG_GAPI_CONFIG,
    //   useValue: gapiClientConfig
    // })
  ],
  providers: [
    AuthGuard,
    CookieService 
    
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
