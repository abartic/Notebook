import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AlertDialogWnd } from './dialogs/alertDialog/alertDialogWnd';
import { AskDialogWnd } from './dialogs/askDialog/askDialogWnd';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule
  ],
  declarations: [
    AlertDialogWnd,
    AskDialogWnd,
  ],
  entryComponents: [
    AlertDialogWnd,
    AskDialogWnd,
  ]
})
export class CoreModule { }
