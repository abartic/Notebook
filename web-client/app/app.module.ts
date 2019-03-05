
import { UserSessionService } from './services/userSessionService';
import { CalendarDialogWnd } from './dialog/calendarDialog/calendarDialogWnd';
import { LoadingModule } from 'ngx-loading';
import { HttpClientModule, HttpClient, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared';
import { CookieService } from 'ngx-cookie-service';
import { HttpCallerService } from './services/httpcaller.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertDialogWnd } from './dialog/alertDialog/alertDialogWnd';
import { AskDialogWnd } from './dialog/askDialog/askDialogWnd';
import { EditEntityDialogWnd } from './dialog/editEntityDialog/editEntityDialogWnd';
import { SelectEntityDialogWnd } from './dialog/selectEntityDialog/selectEntityDialogWnd';
import { CheckLoginService } from './services/check-login-service';
import { CommonModule } from '@angular/common';
import { SafePipe } from './shared/pipes/safeurl';
import { ReportDialogWnd } from './dialog/reportDialog/reportDialogWnd';
import { SharedModule } from './shared-modules/shared.module';



export const createTranslateLoader = (http: HttpClient) => {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};


@NgModule({
  declarations: [
    AppComponent,
    AlertDialogWnd,
    AskDialogWnd,
    EditEntityDialogWnd,
    SelectEntityDialogWnd,
    ReportDialogWnd,
    CalendarDialogWnd,
    SafePipe,

    
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'xsrf-token',
      headerName: 'x-xsrf-token',
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    LoadingModule,
    SharedModule,
    //NgbModule.forRoot(),
    NgbModule,

  ],
  providers: [
    AuthGuard,
    CookieService,
    HttpCallerService,
    CheckLoginService,
    UserSessionService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AlertDialogWnd,
    AskDialogWnd,
    EditEntityDialogWnd,
    SelectEntityDialogWnd,
    ReportDialogWnd,
    CalendarDialogWnd


  ],
  exports: [

  ]

})
export class AppModule { }
