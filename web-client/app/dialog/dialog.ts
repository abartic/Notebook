
import { Component, Inject, Injectable, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'dialog-wnd',
  templateUrl: './dialog.html'
})
export class DialogWnd {

  @Input() message;
  constructor(public activeModal: NgbActiveModal) {}
}