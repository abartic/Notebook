
import { Component, Inject, Injectable, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'calendar-dialog-wnd',
  templateUrl: './calendarDialog.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./calendarDialog.component.css'],
})
export class CalendarDialogWnd {


  @Input() 
  public calendarUrl : string;
  constructor(public activeModal: NgbActiveModal) {

    
  }
}