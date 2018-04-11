
import { Component, Inject, Injectable, Input, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPackageController } from '../layout/form1/package-controller';
import { BaseEntity } from '../../../server/models/base-entity';



@Component({
  selector: 'select-entity-dialog-wnd',
  templateUrl: './selectEntityDialog.html'
})
export class SelectEntityDialogWnd implements OnInit {

  @Input() title;

  @Input() lookupSource: BaseEntity;
  @Input() lookupSourceProperty: String;
  @Input() lookupTargetProperty: String;

  @Input() lookupEntity: BaseEntity;
  @Input() lookupProperties: string[];
  @Input() package;
  @Input() packageCtrl: IPackageController;
  constructor(public activeModal: NgbActiveModal) {


  }

  ngOnInit() {

    this.packageCtrl.executeLookupFilter(true);
  }

  onSelectLookupPage(index) {
    this.package.lookup_row_current_page = index;
    this.packageCtrl.executeLookupFilter();
  }

  onNextLookupPage() {

    this.package.lookup_row_current_page++;
    this.packageCtrl.executeLookupFilter();
  }

  onPreviousLookupPage() {

    this.package.lookup_row_current_page--;
    this.packageCtrl.executeLookupFilter();
  }
}