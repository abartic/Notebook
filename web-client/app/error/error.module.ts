
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ErrorRoutingModule } from './error-routing.module';
import { ErrorComponent } from './error.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ErrorRoutingModule,
        FormsModule
    ],
    declarations: [ErrorComponent]
})
export class ErrorModule {
}
