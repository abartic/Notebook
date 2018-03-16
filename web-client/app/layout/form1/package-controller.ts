import { ModelInfos } from './../../../../server/models/modelProperties';
import { ModelFactory } from './../../../../server/models/modelFactory';
import { HttpCallerService } from './../../services/httpcaller.service';
import { BaseEntity, IPropInfo, IEntityInfo } from './../../../../server/models/base-entity';
import { Package } from './package';
import { Input, Inject, Injectable } from '@angular/core';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { eEntityStatus } from '../../../../server/models/base-entity';
import { DialogWnd } from '../../dialog/dialog';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';




export interface IPackageController {

    onClear();

    onApply();

    onSelectPage(index);

    onNextPage();

    onPreviousPage();

    onExecuteFilter(count: boolean);

    onSelectEntity(row);

    onNew();

    onSave();

    onDelete();

    onUndo();

    package;
}

export class PackageController<T extends BaseEntity> implements IPackageController {

    public package: Package<T>;

    constructor(
        private type: new () => T,
        private modalService : NgbModal,
        private httpCaller : HttpCallerService) {

        this.package = new Package<T>(type);
        this.onInit();
    }

    private onInit() {
        let entity = this.package.filter;
        this.readInfo(entity);
    }

    private readInfo(entity: BaseEntity)
    {
        this.httpCaller.callPost(
            '/sheetdata/spreadsheet-info',
            {
                spreadsheetName: entity.spreadsheetName,
                sheetName: entity.sheetName,
                entityName: entity.entityName
            },
            result => {
                
                if (result.error === undefined) {
                    const info = <IEntityInfo>result;
                    ModelInfos.uniqueInstance.add(entity.entityName, info);
                    if (info.relations)
                    {
                        for(let relation of info.relations)
                        {
                            let rentity = <BaseEntity>ModelFactory.uniqueInstance.create(relation.toLowerCase());
                            if (rentity)
                                this.readInfo(rentity);
                        }
                    }
                }

            },
            err => {
                this.package.error_msg = 'Connection error! ' + this.getError(err);
            });
    }

    onClear() {
        if (this.package.filter) {
            this.package.filter.clearFilter();
        }
        this.package.row_current_page = 0;
        this.onExecuteFilter(true);
    }

    onApply() {
        this.package.row_current_page = 0;
        this.onExecuteFilter(true);
    }

    onSelectPage(index) {
        this.package.row_current_page = index;
        this.onExecuteFilter(false);
    }

    onNextPage() {

        this.package.row_current_page++;
        this.onExecuteFilter(false);
    }

    onPreviousPage() {

        this.package.row_current_page--;
        this.onExecuteFilter(false);
    }

    onExecuteFilter(count: boolean) {

        let offset = this.package.row_current_page * this.package.row_page_max;
        let limit = this.package.row_page_max;
        let query = this.package.filter.toFilter(offset, limit);
        let shellinfo = this.package.filter.entityInfo;

        let count_query = undefined;
        if (count === true) {
            count_query = this.package.filter.toCountFilter(offset, limit);


            this.httpCaller.callPost(
                '/sheetdata/getscalar',
                {
                    spreadsheetName: shellinfo.spreadsheetName,
                    sheetName: shellinfo.sheetName,
                    entityName: shellinfo.entityName,
                    select: count_query
                },
                result => {
                    this.package.row_count = result.scalar;
                    let pages = (this.package.row_count) / this.package.row_page_max;
                    this.package.row_pages = new Array<number>(toInteger(pages));
                },
                err => {
                    this.package.error_msg = 'Connection error! ' + this.getError(err);
                });

        }

        this.httpCaller.callPost('/sheetdata/select',
            {
                spreadsheetName: shellinfo.spreadsheetName,
                sheetName: shellinfo.sheetName,
                entityName: shellinfo.entityName,
                select: query
            },
            result => {
                this.package.rows = result.rows;
            },
            err => {
                this.package.error_msg = 'Connection error! ' + this.getError(err);
            });
    }

    onSelectEntity(row) {
        this.package.selected_row = row;
        let selPartner = BaseEntity.createInstance(this.type, row);
        let query = selPartner.toUKeyFilter();
        let shellinfo = selPartner.entityInfo;

        this.httpCaller.callPost('/sheetdata/select',
            {
                spreadsheetName: shellinfo.spreadsheetName,
                sheetName: shellinfo.sheetName,
                entityName: shellinfo.entityName,
                select: query
            },
            result => {
                let rows = result.rows as Array<any>;
                if (rows.length > 0) {
                    this.package.entity = BaseEntity.createInstance(this.type, rows[0]);
                    this.package.entity.status = eEntityStatus.Loaded;
                    this.package.show_filter = false;
                    this.package.entity_status_msg = '';
                    this.package.error_msg = '';
                }
            },
            err => {

                this.package.error_msg = 'Connection error! ' + this.getError(err);
            });


    }

    onNew() {

        this.package.entity = BaseEntity.createInstance(this.type); //new Partner();
        this.package.entity.status = eEntityStatus.New;
        this.package.entity_status_msg = '';
        this.package.error_msg = '';
        this.package.show_filter = false;

    }

    onSave() {

        if (this.package.entity.status === eEntityStatus.Deleted) {
            this.showAlert('Entity deleted already!');
            return;
        }

        let url = '';
        if (this.package.entity.status === eEntityStatus.Loaded)
            url = '/sheetdata/update';
        else
            url = '/sheetdata/create';

        let shellinfo = this.package.entity.entityInfo;
        this.httpCaller.callPost(url,
            {
                spreadsheetID: this.package.entity.entityInfo.spreadsheetID,
                sheetName: shellinfo.sheetName,
                sheetID: this.package.entity.entityInfo.sheetID,
                values: this.package.entity.toArray()
            },
            result => {
                if (this.package.entity.status === eEntityStatus.Loaded)
                    Object.assign(this.package.selected_row, this.package.entity);
                this.package.entity_status_msg = 'Entity saved.';
                this.package.entity.status = eEntityStatus.Loaded;
            },
            err => {
                this.package.error_msg = this.getError(err);
            });
    }

    onDelete() {
        if (this.package.entity.status === eEntityStatus.Deleted) {
            this.showAlert('Entity deleted already!');
            return;
        }

        if (this.package.entity.status === eEntityStatus.New) {
            this.showAlert('New entity will be deleted!');
            this.package.show_filter = true;
            return;
        }

        this.package.entity.status = eEntityStatus.Deleted;
        let shellinfo = this.package.entity.entityInfo;

        this.httpCaller.callPost('/sheetdata/delete',
            {
                spreadsheetID: this.package.entity.entityInfo.spreadsheetID,
                sheetName: shellinfo.sheetName,
                sheetID: this.package.entity.entityInfo.sheetID,
                ID: this.package.entity.uid,
                rowid: this.package.entity.rowid
            },
            result => {
                let index = this.package.rows.indexOf(this.package.selected_row);
                this.package.rows = this.package.rows.splice(index, 1);
                this.package.entity_status_msg = 'Entity deleted.';

            },
            err => {
                this.package.error_msg = this.getError(err);
            });
    }

    onUndo() {
        if (this.package.entity.status === eEntityStatus.Deleted
            || this.package.entity.status === eEntityStatus.New) {
            this.showAlert('Entity new/deleted cannot undo!');
            return;
        }

        let query = this.package.entity.toUKeyFilter();
        let shellinfo = this.package.entity.entityInfo;

        this.httpCaller.callPost('/sheetdata/select',
            {
                spreadsheetName: shellinfo.spreadsheetName,
                sheetName: shellinfo.sheetName,
                entityName: shellinfo.entityName,
                select: query
            },
            result => {
                let rows = result.rows as Array<any>;
                if (rows.length > 0) {
                    this.package.entity = BaseEntity.createInstance(this.type, rows[0]);
                }
                this.package.entity_status_msg = 'Entity restored.';
            },
            err => {
                this.package.error_msg = this.getError(err);
            });
    }

    clearMsg(showFilter?: boolean) {

        this.package.entity_status_msg = '';
        this.package.error_msg = '';
        if (showFilter)
            this.package.show_filter = showFilter;
    }

    private getError(err): string {
        return err instanceof String ? err.toString() : JSON.stringify(err);

    }

    private showAlert(message: string) {

        const modalRef = this.modalService.open(DialogWnd);
        modalRef.componentInstance.message = message;
    }

    isDisabled(entity, property) {
        if (entity === undefined || entity.status === eEntityStatus.Deleted) {
            return true;
        }
        else {
            return false;
        }
    }

    isVisible(entity: T, property: IPropInfo) {
        if (property.propName === 'uid' || property.propName === 'rowid') {
            return false;
        }
        else {
            return true;
        }
    }

    private filter_properties = [];
    public get filterProperties() {

        if (this.package.filter === undefined || this.package.filter.properties === undefined)
            return this.filter_properties;

        if (this.filter_properties.length == 0) {
            for (let p of this.package.filter.properties) {
                if (this.isVisible(null, p))
                    this.filter_properties.push(p);
            }
        }
        return this.filter_properties;
    }

    public getRelationProperties(relation : string) {
        let info = ModelInfos.uniqueInstance.get(relation.toLowerCase());
        return info;
    }

}
