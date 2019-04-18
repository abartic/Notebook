
import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
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

  get isFrameVisible()
  {
    return environment.mobile === false;
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
              
              cordova.plugins.fileOpener2.open(e.target.localURL, 'application/pdf',
                {
                  error: function (e) {
                    console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                  },
                  success: function () {
                    console.log('file opened successfully');
                    that.activeModal.dismiss('Cancel')
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