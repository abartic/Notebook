
import { Component, Inject, Injectable, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'ask-dialog-wnd',
  templateUrl: './askDialog.html'
})
export class AskDialogWnd {

  @Input() message;
  constructor(public activeModal: NgbActiveModal) {

    
  }
}