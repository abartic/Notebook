
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'ask-dialog-wnd',
  templateUrl: './askDialog.html'
})
export class AskDialogWnd {

  @Input() message;
  constructor(public activeModal: NgbActiveModal) {

    
  }
}