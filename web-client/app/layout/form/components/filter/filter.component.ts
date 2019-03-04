import { Package } from './../../package';
import { IPropInfo } from './../../../../../../server/models/base-entity';
import { IPackageController } from './../../ipackage-controller';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from "../../../../router.animations";





@Component({
  selector: 'form-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  animations: [routerTransition()]
})
export class FilterComponent implements OnInit {



  public isCollapsed = false;
  @Input() package;
  @Input() packageCtrl: IPackageController;
  @ViewChild('rootdiv') rootdiv: ElementRef;
  @ViewChild('tableheader') tableheader: ElementRef;



  public screensize: string;
  public selectedFilterCond: { entityName: string, property: IPropInfo, display: string } = null;
  public filterConditionValue: string;


  ngOnInit() {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');


  }

  onScroll() {
    this.packageCtrl.executeFilter();
  }

  onResize(event) {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

    this.calculateMaxFilterItem();
    this.packageCtrl.checkFilter();
  }

  checkSize() {
    return (this.screensize || '').trim() === 'sm';
  }



  onClear() {
    this.calculateMaxFilterItem();

    this.packageCtrl.onClear();
  }

  onAddFilterCond() {
    if (!this.filterConditionValue)
      return;
    this.packageCtrl.onAddFilterCond(this.selectedFilterCond, this.filterConditionValue);
    this.filterConditionValue = null;
  }

  onApply() {
    if (this.filterConditionValue)
      this.onAddFilterCond();

    this.calculateMaxFilterItem();

    this.packageCtrl.onApply();
  }

  calculateMaxFilterItem() {
    if (this.rootdiv && this.tableheader && this.tableheader.nativeElement.offsetHeight > 0 && this.rootdiv.nativeElement.offsetHeight > 0) {
      this.package.filter_items_max = Math.ceil((this.rootdiv.nativeElement.offsetHeight / this.tableheader.nativeElement.offsetHeight) * 1.5);
    }
  }

  onSelectEntity(row) {
    this.packageCtrl.onSelectEntity(row);
  }
  onNew() {
    this.packageCtrl.onNew();
  }

  onFilterValueChanged(event) {
    if (event.keyCode === 13) {

      event.preventDefault();
      this.onAddFilterCond();
    }

  }

  onSelectedFilterCond(item) {
    this.selectedFilterCond = item.filterCondition;
    this.filterConditionValue = item.filterConditionValue;
  }
}
