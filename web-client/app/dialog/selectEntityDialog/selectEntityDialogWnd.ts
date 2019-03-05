import { ModelInfos } from './../../../../server/models/modelProperties';
import { IEntityInfo, IShellInfo } from './../../../../server/models/base-entity';

import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPackageController } from '../../layout/form/ipackage-controller';
import { BaseEntity, IPropInfo } from '../../../../server/models/base-entity';



@Component({
  selector: 'select-entity-dialog-wnd',
  styleUrls: ['./selectEntityDialog.component.css'],
  templateUrl: './selectEntityDialog.html'
})
export class SelectEntityDialogWnd implements OnInit {

  @Input() title;

  @Input() lookupSource: BaseEntity;
  @Input() lookupSourceProperty: string;
  @Input() lookupTargetProperty: string;

  @Input() lookupEntityName: string;
  @Input() lookupProperties: string[];
  @Input() package;
  @Input() packageCtrl: IPackageController;

  @ViewChild('rootdiv') rootdiv: ElementRef;
  @ViewChild('tableheader') tableheader: ElementRef;

  public screensize: string;
  public selectedFilterCond: IPropInfo = null;
  public filterConditionValue: string;


  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
    this.checkFilter(false);
  }

  onChangedFilterCond() {
    if (this.selectedFilterCond === null)
      this.filterConditionValue = undefined;
  }


  onResize(event) {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

    this.calculateMaxFilterItem();
    this.checkFilter(true);
  }

  calculateMaxFilterItem() {
    if (this.rootdiv && this.tableheader && this.tableheader.nativeElement.offsetHeight > 0 && this.rootdiv.nativeElement.offsetHeight > 0) {
      this.package.filter_items_max = Math.ceil((this.rootdiv.nativeElement.offsetHeight / this.tableheader.nativeElement.offsetHeight) * 1.5);
    }
  }


  checkSize() {
    return (this.screensize || '').trim() === 'sm';
  }

  onScroll() {
    this.checkFilter(false);
  }


  onApply() {
    this.calculateMaxFilterItem();
    this.checkFilter(false);
  }

  onFilterValueChanged(event) {
    this.resetFilter = true;
  }

  resetFilter: boolean = true;
  checkFilter(check: boolean) {
    let filterItems = [];
    if (this.selectedFilterCond !== null && this.filterConditionValue) {
      filterItems.push(
        {
          filterCondition: { entityName: this.lookupEntityName, property: this.selectedFilterCond },
          filterConditionValue: this.filterConditionValue
        });
    }

    if (check === false || (check === true && this.packageCtrl.package.lookup_rows.length <= this.packageCtrl.package.filter_items_max)) {
      this.packageCtrl.executeLookupFilter(this.lookupEntityName, filterItems, this.resetFilter);
      this.resetFilter = false;
    }
  }

  private properties;
  public getLookupProperties() {

    if (!this.properties) {
      this.properties = [];
      const entityInfo: IEntityInfo = ModelInfos.uniqueInstance.get(this.lookupEntityName);

      for (const property of entityInfo.properties) {
        if (property.isHidden !== true && this.lookupProperties.includes(property.propName)) {
          this.properties.push(property);
        }
      }
    }
    return this.properties;
  }

}