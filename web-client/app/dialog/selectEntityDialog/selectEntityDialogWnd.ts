
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPackageController } from '../../layout/form/ipackage-controller';
import { BaseEntity } from '../../../../server/models/base-entity';



@Component({
  selector: 'select-entity-dialog-wnd',
  styleUrls: ['./selectEntityDialog.component.css'],
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

  @ViewChild('rootdiv') rootdiv: ElementRef;
  public screensize : string;

  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {
    this.packageCtrl.executeLookupFilter(true);
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
  }

  onResize(event) {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
  }

  checkSize()
  {
    return (this.screensize || '').trim() === 'sm';
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