
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateUserFormatPipe } from '../pipes/date-userformat-pipe';



@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [DateUserFormatPipe],
    exports: [DateUserFormatPipe],

})
export class SharedModule { }