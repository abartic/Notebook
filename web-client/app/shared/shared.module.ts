
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateUserFormatPipe } from './pipes/date-userformat-pipe';
import { SafePipe } from './pipes/safeurl';




@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        DateUserFormatPipe,
        SafePipe,
    ],
    exports: [
        DateUserFormatPipe,
        SafePipe,
    ],

})
export class SharedModule { }