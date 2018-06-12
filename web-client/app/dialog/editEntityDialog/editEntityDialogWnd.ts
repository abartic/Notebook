
import { Component, Inject, Injectable, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPackageController } from '../../layout/form/package-controller';


@Component({
  selector: 'edit-entity-dialog-wnd',
  templateUrl: './editEntityDialog.html'
})
export class EditEntityDialogWnd {

  @Input() title;
  @Input() package;
  @Input() packageCtrl: IPackageController;
  constructor(public activeModal: NgbActiveModal) {

    
  }
}