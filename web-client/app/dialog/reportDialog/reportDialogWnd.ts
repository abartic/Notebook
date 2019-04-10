
import { Component, Inject, Injectable, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import * as uuidv1 from 'uuid/v1';
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


  newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  ngOnInit() {

    if (environment.mobile === true) {
      let fileName = this.newGuid() + ".pdf";
      let that = this;

      window['resolveLocalFileSystemURL'](cordova.file.externalApplicationStorageDirectory, function (directoryEntry) {
        directoryEntry.getFile(fileName, {
          create: true
        }, function (fileEntry) {
          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function (e) {
              console.log(e);
              console.log(e.target.localURL);
              cordova.plugins.fileOpener2.open(e.target.localURL, 'application/pdf',
                {
                  error: function (e) {
                    console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                  },
                  success: function () {
                    console.log('file opened successfully');
                  }
                }
              );
            };

            fileWriter.onerror = function (e) {
              console.log(e.toString());
            };

            fileWriter.write(that.reportUrl);
          });
        });
      });


    }
  }
}