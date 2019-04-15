import { UserSessionService } from './../../../../services/userSessionService';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { eEntityStatus, BaseEntity } from './../../../../../../server/models/base-entity';
import { Component, OnInit, Input, ViewChild, AfterViewChecked } from '@angular/core';
import { IPackageController } from '../../ipackage-controller';
import { routerTransition } from '../../../../router.animations';
import { WebDataRocksPivot } from '../../../../webdatarocks/webdatarocks.angular4';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertDialogWnd } from '../../../../dialog/alertDialog/alertDialogWnd';
import { ShellInfos } from '../../../../../../server/models/modelProperties';
import { UserSession } from '../../../../common/userSession';


@Component({
  selector: 'form-editor-pivot-relation',
  templateUrl: './pivot.component.html',
  styleUrls: ['./pivot.component.css'],
  animations: [routerTransition()],

})
export class PivotRelationComponent implements OnInit {

  private _package;
  @Input() set package(value) {
    this._package = value;
    if (this._package) {
      let shellInfo = ShellInfos.uniqueInstance.get(this.package.entity.entityName);
      for (let f of shellInfo.pivotInfo.slice.columns)
        this.availableFields.push(f.uniqueName);
      for (let f of shellInfo.pivotInfo.slice.rows)
        this.availableFields.push(f.uniqueName);
      for (let f of shellInfo.pivotInfo.slice.measures)
        this.availableFields.push(f.uniqueName);
    }
  }
  get package() {
    return this._package;
  }

  @Input() packageCtrl: IPackageController;
  @Input() relation: string;
  @ViewChild('pivot1') child: WebDataRocksPivot;


  @Input()
  set list(value: BaseEntity[]) {
    //console.log(value);
    this.updatePivotDataSource(true);
  }

  @Input()
  set needRefresh(propChanged: string) {
    if (propChanged === "pivot_by") {
      this.updatePivotDataSource(true);

    }
  }

  userSession: UserSession;
  constructor(private modalService: NgbModal, private translateService: TranslateService, private userSessionService: UserSessionService) {
    this.userSessionService.userSession.subscribe(
      us => { this.userSession = us },
      error => { });
  }

  ngOnInit() {

  }

  onReportComplete(): void {
    this.package.entity.clearPropChanged();
  }

  private availableFields = [];
  onPivotReady(pivot: WebDataRocks.Pivot): void {

  }

  onCustomizePivotCell(cell: WebDataRocks.CellBuilder, data: WebDataRocks.Cell): void {
    //console.log("[customizeCell] WebDataRocksPivot");
    if (data.isClassicTotalRow) cell.addClass("fm-total-classic-r");
    if (data.isGrandTotalRow) cell.addClass("fm-grand-total-r");
    if (data.isGrandTotalColumn) cell.addClass("fm-grand-total-c");
  }




  getAdjustedShellInfoSlice() {
    let pivot_by = this.package.entity['pivot_by'];

    if (!pivot_by || pivot_by === '')
      return [];

    let fields = pivot_by.split(',').map(f => f.trim());
    let shellInfo = ShellInfos.uniqueInstance.get(this.package.entity.entityName);
    let slice = JSON.parse(JSON.stringify(shellInfo.pivotInfo.slice));
    let row_delete = [];
    for (let row of slice.rows) {
      let index = fields.findIndex(f => f === row.uniqueName);
      if (index < 0)
        row_delete.push(row);
    }
    row_delete.forEach(r => {
      slice.rows = slice.rows.filter(e => e !== r);

    });
    let column_delete = [];
    for (let column of slice.columns) {
      let index = fields.findIndex(f => f === column.uniqueName);
      if (index < 0)
        column_delete.push(column);
    }
    column_delete.forEach(c => {
      slice.columns = slice.columns.filter(e => e !== c);

    });

    slice.rows.forEach(c => {
      c.caption = this.translateService.instant(c.caption);
    });
    slice.columns.forEach(c => {
      c.caption = this.translateService.instant(c.caption);
    });
    slice.measures.forEach(m => {
      m.caption = this.translateService.instant(m.caption);
    });

    return slice;
  }

  updatePivotDataSource(forceRedraw: boolean) {

    if (!this.package.entity[this.relation + '_relation'])
      return;

    let objs = this.package.entity[this.relation + '_relation'].map(e => {
      return e.adjustDataForPivoting(this.availableFields);
    });
    if (this.child.webDataRocks.getColumns() && this.child.webDataRocks.getColumns().length > 0 && forceRedraw === false) {

      this.child.webDataRocks.updateData({
        data: objs
      });
    }
    else {



      let slice = this.getAdjustedShellInfoSlice();
      if (objs.length === 0) {

        this.child.webDataRocks.clear();
      } else {
        this.child.webDataRocks.setReport({
          dataSource: {
            data: objs
          },
          slice: slice,
          localization: this.userSession.Language === "en" ? null : "../../../../app/webdatarocks/localization/" + this.userSession.Language + ".json"

        });

      }

      this.child.webDataRocks.setOptions({

        editing: true,
        drillThrough: false,
        showAggregationLabels: false,
        grid: {
          showHeaders: true,

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
      this.showAlert(this.translateService.instant("MSG.PIVOT_EDIT_AGGR_CELL"));
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
      this.showAlert(this.translateService.instant("MSG.PIVOT_RECORD_MISSING"));
      return;
    } else if (f_details > 1) {
      this.showAlert(this.translateService.instant("MSG.PIVOT_MULTI_RECORDS"));
      return;
    }

    this.packageCtrl.onEditEntityByRelation(f_detail, this.relation,
      this.validate,
      () => {
        this.refreshCurrentRecord();
        this.updatePivotDataSource(false);
      });


  }

  onCreateEntityByRelation() {
    if (this.getAdjustedShellInfoSlice() === []) {
      this.showAlert(this.translateService.instant("MSG.PIVOT_SET_PIVOT_BY"));
      return;
    }

    this.packageCtrl.onCreateEntityByRelation(this.relation,
      this.validate,
      () => {
        this.refreshCurrentRecord();
        this.updatePivotDataSource(false);
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
        this.showAlert(this.translateService.instant("MSG.PIVOT_DATA_COLLISION"));
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
