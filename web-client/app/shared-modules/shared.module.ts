
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DateUserFormatPipe } from '../shared';



@NgModule({
    imports: [
        CommonModule,

    ],
    declarations: [DateUserFormatPipe],
    exports: [DateUserFormatPipe]
})
export class SharedModule { }