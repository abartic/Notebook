import { ModelInfos } from './../../../../server/models/modelProperties';
import { IEntityInfo, IShellInfo } from './../../../../server/models/base-entity';

import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPackageController } from '../../layout/form/ipackage-controller';
import { BaseEntity, IPropInfo } from '../../../../server/models/base-entity';



@Component({
  selector: 'select-entity-dialog-wnd',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./selectEntityDialog.component.css'],
  templateUrl: './selectEntityDialog.html'
})
export class SelectEntityDialogWnd implements OnInit, AfterViewInit {

  @Input() title;

  @Input() lookupSource: BaseEntity;
  @Input() lookupSourceProperty: string;
  @Input() lookupTargetProperty: string;

  @Input() lookupEntityName: string;
  @Input() lookupProperties: string[];
  @Input() package;
  @Input() packageCtrl: IPackageController;

  @ViewChild('rootdiv') rootdiv: ElementRef;
  @ViewChild('dtablerow') dtablerow: ElementRef;
  @ViewChild('tablerow') tablerow: ElementRef;

  public screensize: string;
  public selectedFilterCond: IPropInfo = null;
  public filterConditionValue: string;


  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {

  }

  onChangedFilterCond() {
    if (this.selectedFilterCond === null)
      this.filterConditionValue = undefined;
  }


  onResize(event) {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
    //this.rootdiv.nativeElement.style.height = (window.innerHeight - 400).toString() + "px";
    
    this.rowheight = this.tablerow ? this.tablerow.nativeElement.offsetHeight : this.rowheight;
    this.packageCtrl.calculateMaxFilterItem(this.rowheight);

    this.checkFilter(true);
  }


  private rowheight = 0;
  ngAfterViewInit(): void {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
    //this.rootdiv.nativeElement.style.height = (window.innerHeight - 400).toString() + "px";

    if (this.dtablerow){
      this.rowheight = this.dtablerow.nativeElement.offsetHeight;
      this.dtablerow.nativeElement.style.display = "none";
    }

    this.packageCtrl.calculateMaxFilterItem(this.rowheight);

    this.checkFilter(false);
  }

  isSmallSizeScreen() {
    return (this.screensize || '').trim() === 'sm';
  }

  onScroll() {
    this.checkFilter(false);
  }


  onApply() {
    this.rowheight = this.tablerow ? this.tablerow.nativeElement.offsetHeight : this.rowheight;
    this.packageCtrl.calculateMaxFilterItem(this.rowheight);
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