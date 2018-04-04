import { SelectEntityDialogWnd } from './selectEntityDialog';
import { EditEntityDialogWnd } from './editEntityDialog';
import { AlertDialogWnd } from './alertDialog';


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AskDialogWnd } from './askdialog';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    
  ],
  declarations: [
    AlertDialogWnd,
    AskDialogWnd,
    EditEntityDialogWnd,
    SelectEntityDialogWnd
    
  ],
  providers:[
    //{provide:'Partner', useFactory:()=>(new Package<Partner>(Partner))},
    
  ]
})
export class DialogModule { }


