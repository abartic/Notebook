import { map } from 'rxjs/operators';

import { eEntityAction, eEntityStatus, BaseEntity } from './../../../../../../server/models/base-entity';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IPackageController } from '../../package-controller';
import { routerTransition } from '../../../../router.animations';
import { WebDataRocksPivot } from '../../../../webdatarocks/webdatarocks.angular4';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertDialogWnd } from '../../../../dialog/alertDialog/alertDialogWnd';


@Component({
  selector: 'form-editor-pivot-relation',
  templateUrl: './pivot.component.html',
  styleUrls: ['./pivot.component.css'],
  animations: [routerTransition()],

})
export class PivotRelationComponent implements OnInit {


  @Input() package;
  @Input() packageCtrl: IPackageController;
  @Input() relation: string;
  @ViewChild('pivot1') child: WebDataRocksPivot;

  @Input()
  set list(value: BaseEntity[]) {
    //console.log(value);
    this.updatePivotDataSource();
  }

  constructor(private modalService: NgbModal) { }

  ngOnInit() {

  }

  onPivotReady(pivot: WebDataRocks.Pivot): void {
    console.log("[ready] WebDataRocksPivot", this.child);

  }

  onCustomizePivotCell(cell: WebDataRocks.CellBuilder, data: WebDataRocks.Cell): void {
    //console.log("[customizeCell] WebDataRocksPivot");
    if (data.isClassicTotalRow) cell.addClass("fm-total-classic-r");
    if (data.isGrandTotalRow) cell.addClass("fm-grand-total-r");
    if (data.isGrandTotalColumn) cell.addClass("fm-grand-total-c");
  }


  // onPivotComplete(): void {
  //   this.child.webDataRocks.off("reportcomplete");
  //   this.packageCtrl.setPivotData((data: Array<any>, pivotInfo) => {

  //     this.updatePivotDataSource();
  //   });
  // }

  updatePivotDataSource() {

    if (!this.package.entity[this.relation + '_relation'])
      return;

    let objs = this.package.entity[this.relation + '_relation'].map(e => {
      return e.adjustDataForPivoting();
    });
    if (this.child.webDataRocks.getColumns().length > 0) {
      this.child.webDataRocks.updateData({
        data: objs
      });
    }
    else {
      let slice = this.package.entity.getAdjustedShellInfoSlice();
      if (objs.length === 0) {

        this.child.webDataRocks.clear();
      } else {
        this.child.webDataRocks.setReport({
          dataSource: {
            data: objs
          },
          slice: slice,

        });

      }
      this.child.webDataRocks.setOptions({

        editing: true,
        drillThrough: false,
        showAggregationLabels: false,
        configuratorActive: false,
        configuratorButton: false,
        grid: {
          showHeaders: false,

        }
      });
    }
  }

  showAlert(msg: string) {
    const modalRef = this.modalService.open(AlertDialogWnd);
    modalRef.componentInstance.message = msg;
  }

  onPivotCellClick($event) {

    let rows = $event.rows;
    let columns = $event.columns;
    let report: WebDataRocks.Report = <WebDataRocks.Report>this.child.webDataRocks.getReport();
    if (rows.length !== report.slice.rows.length || columns.length !== report.slice.columns.length - 1) {
      this.showAlert("Can edit only not-aggregated cell!");
      return;
    }

    let filters: string[] = [];
    for (let row of rows.concat(columns)) {
      let keyvalue = row['uniqueName'].split('.').map(i => i.trim());
      filters.push(keyvalue);
    }

    let details: any[] = this.package.entity[this.relation + '_relation'];
    let f_detail = null, f_details = 0;
    for (let detail of details) {
      let ignored = false;
      for (let filter of filters) {
        if ((detail[filter[0]] === undefined && filter[1] === '') ||
          (detail[filter[0]] !== undefined && (detail[filter[0]]).toString() !== filter[1].toString())) {
          ignored = true;
          break;
        }
      }
      if (ignored === false) {
        f_detail = detail;
        f_details++;
      }
    }

    if (!f_detail) {
      this.showAlert("Record missing! Add new record!");
      return;
    } else if (f_details > 1) {
      this.showAlert("Multiples record for selected cell! Adjust dimensions in order to edit!");
      return;
    }

    this.packageCtrl.onEditEntityByRelation(f_detail, this.relation,
      this.validate,
      () => {
        this.refreshCurrentRecord();
        this.updatePivotDataSource();
      });


  }

  onCreateEntityByRelation() {
    if (this.package.entity.getAdjustedShellInfoSlice() === []) {
      this.showAlert("Set pivot by property");
      return;
    }

    this.packageCtrl.onCreateEntityByRelation(this.relation,
      this.validate,
      () => {
        this.refreshCurrentRecord();
        this.updatePivotDataSource();
      })
  }

  private validate(): boolean {
    if (this.package.entity_relation && this.relation && this.package.entity[this.relation + '_relation']) {
      let details: any[] = this.package.entity[this.relation + '_relation'];
      let finds = 0;
      for (let detail of details) {
        if (this.package.entity_relation.compareForValidation(detail))
          finds++;
      }

      if ((this.package.entity_relation.status === eEntityStatus.New && finds > 0) || (finds > 1)) {
        this.showAlert('Same type of values by periode should be unique! You have data colision!');
        return false;
      }

    }

    return true;
  }

  private refreshCurrentRecord() {
    if (this.package.entity_relation) {
      if (this.package.entity_relation.status !== eEntityStatus.Deleted) {
        this.package.entity_relation['_row_'] = undefined;
        let temp = {};
        Object.assign(temp, this.package.entity_relation);
        this.package.entity.onChildrenUpdate();
        delete temp['_row_'];
        delete temp['uid'];
        delete temp['status'];
        if (this.package.entity.ukeyPropName)
          delete temp[this.package.entity.ukeyPropName];
        this.package.entity_relation['_row_'] = temp;
      }
    }
  }
}
