
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPackageController } from '../../models/ipackage-controller';
import { AlertDialogWnd } from '../../../../core/dialogs/alertDialog/alertDialogWnd';
import { AskDialogWnd } from '../../../../core/dialogs/askDialog/askDialogWnd';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'edit-entity-dialog-wnd',
  templateUrl: './editEntityDialog.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./editEntityDialog.component.css'],
})
export class EditEntityDialogWnd {

  @Input() title;
  @Input() package;
  @Input() packageCtrl: IPackageController;
  @Input() validationFunc: () => boolean;
  @Input() relation: string;
  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private translateService: TranslateService) {

  }

  onSave() {
    if (this.validationFunc && this.validationFunc() === false) {
      
      return;
    }
    this.activeModal.close('Save');
  }

  onDelete() {

    this.askYesNo(this.translateService.instant("MSG.DELETE_ITEM")).then(result => {
      if (result === 'Yes') {
        this.activeModal.close('Delete');
      }
    });

  }

  private showAlert(message: string) {

    const modalRef = this.modalService.open(AlertDialogWnd);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
  private askYesNo(message: string) {

    const modalRef = this.modalService.open(AskDialogWnd);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }
}