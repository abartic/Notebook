
import { Component, Inject, Injectable, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
declare var cordova;

@Component({
  selector: 'report-dialog-wnd',
  templateUrl: './reportDialog.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./reportDialog.component.css'],
})
export class ReportDialogWnd implements OnInit {

  @Input() reportUrl;
  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {

    if (environment.mobile === true) {
      cordova.plugins.fileOpener2.open(
        this.reportUrl,
        'application/pdf',
        {
          error: function (e) {
            console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
          },
          success: function () {
            console.log('file opened successfully');
          }
        }

      );
    }
  }
}