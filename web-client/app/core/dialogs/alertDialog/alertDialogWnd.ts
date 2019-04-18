
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'alert-dialog-wnd',
  templateUrl: './alertDialog.html'
})
export class AlertDialogWnd {

  @Input() message;
  constructor(public activeModal: NgbActiveModal) {}
}