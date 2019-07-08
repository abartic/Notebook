
import { IPropInfo } from '../../../../../../server/models/base-entity';
import { IPackageController } from '../../models/ipackage-controller';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { routerTransition } from "../../../../router.animations";





@Component({
  selector: 'form-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  animations: [routerTransition()]
})
export class FilterComponent implements OnInit, AfterViewInit {



  public isCollapsed = false;
  @Input() package;
  @Input() packageCtrl: IPackageController;
  @ViewChild('rootdiv') rootdiv: ElementRef;
  @ViewChild('dtablerow') dtablerow: ElementRef;
  @ViewChild('tablerow') tablerow: ElementRef;


  public screensize: string;
  public selectedFilterCond: { entityName: string, property: IPropInfo, display: string } = null;
  public filterConditionValue: string;
  

  ngOnInit() {

  }

  private rowheight = 0;
  ngAfterViewInit() {

    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

    if (this.dtablerow) {
      this.rowheight = this.dtablerow.nativeElement.offsetHeight;
      this.dtablerow.nativeElement.style.display = "none";
    }

    this.packageCtrl.calculateMaxFilterItem(this.rowheight);
   

  }

  toggleSortOrder() {
    this.package.sortAscOrder = !this.package.sortAscOrder;
    this.packageCtrl.onApplyFilter();
  }
  applySortOrder(p) {
    this.package.sortField = p;
    this.package.sortAscOrder = true;
    this.packageCtrl.onApplyFilter();
  }

  onChangedFilterCond() {
    if (this.selectedFilterCond === null)
      this.filterConditionValue = undefined;
  }

  onScroll() {
    this.packageCtrl.executeFilter();
  }

  onResize(event) {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

    this.rowheight = this.tablerow ? this.tablerow.nativeElement.offsetHeight : this.rowheight;
    this.packageCtrl.calculateMaxFilterItem(this.rowheight);

    if (this.packageCtrl.package.filter_rows.length <= this.packageCtrl.package.fetched_items_max) {
      this.packageCtrl.executeFilter();
    }
  }

  isSmallSizeScreen() {
    return (this.screensize || '').trim() === 'sm';
  }



  onClear() {
    this.rowheight = this.tablerow ? this.tablerow.nativeElement.offsetHeight : this.rowheight;
    this.packageCtrl.calculateMaxFilterItem(this.rowheight);
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

    this.rowheight = this.tablerow ? this.tablerow.nativeElement.offsetHeight : this.rowheight;
    this.packageCtrl.calculateMaxFilterItem(this.rowheight);

    this.packageCtrl.onApplyFilter();

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
      this.onApply();
    }

  }

  onSelectedFilterCond(item) {
    this.selectedFilterCond = item.filterCondition;
    this.filterConditionValue = item.filterConditionValue;
  }


}
