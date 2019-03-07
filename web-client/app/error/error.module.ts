
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ErrorRoutingModule } from './error-routing.module';
import { ErrorComponent } from './error.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        ErrorRoutingModule,
        FormsModule,
        NgbModule,
    ],
    declarations: [ErrorComponent]
})
export class ErrorModule {
}
