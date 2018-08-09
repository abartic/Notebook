
import { Component, Inject, Injectable, Input, ViewEncapsulation } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'report-dialog-wnd',
  templateUrl: './reportDialog.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./reportDialog.component.css'],
})
export class ReportDialogWnd {

  @Input() reportUrl;
  constructor(public activeModal: NgbActiveModal) {}
}