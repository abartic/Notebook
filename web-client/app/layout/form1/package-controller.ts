import { SelectEntityDialogWnd } from './../../dialog/selectEntityDialog';
import { ModelInfos } from './../../../../server/models/modelProperties';
import { ModelFactory } from './../../../../server/models/modelFactory';
import { HttpCallerService } from './../../services/httpcaller.service';
import { BaseEntity, IPropInfo, IEntityInfo, eEntityStatus } from './../../../../server/models/base-entity';
import { Package } from './package';
import { Input, Inject, Injectable } from '@angular/core';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { AlertDialogWnd } from '../../dialog/alertdialog';
import { AskDialogWnd } from '../../dialog/askdialog';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { EditEntityDialogWnd } from '../../dialog/editEntityDialog';





export interface IPackageController {

    onClear();

    onApply();

    onSelectPage(index);

    onNextPage();

    onPreviousPage();

    executeFilter(count?: boolean)

    executeLookupFilter(count?: boolean)

    onSelectEntity(row);

    onNew();

    onSave();

    onDelete();

    onUndo();

    openLookupWnd(lookupProperty: IPropInfo);

    package;

    filterProperties;

    entityType: string;
    
    lookupProperties(lookupEntity: BaseEntity, lookupProperties: string[]);

    getRelationProperties(relation: string);

    onCreateEntityByRelation(relation: string);
}

export class PackageController<T extends BaseEntity> implements IPackageController {

    public package: Package<T>;

    constructor(
        public entityType: string,
        private type: new () => T,
        private modalService: NgbModal,
        private httpCaller: HttpCallerService) {

        this.package = new Package<T>(type);
        this.onInit();
    }

    private onInit() {
        let entity = this.package.filter;
        this.readEntityInfo(entity);
    }



    private readEntityInfo(entity: BaseEntity) {
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

                    if (entity.entityLookups) {
                        for (let property of info.properties) {
                            if (entity.entityLookups.has(property.propName)) {
                                property.lookup_entity_name = entity.entityLookups.get(property.propName).entityName;
                                property.lookup_properties = entity.entityLookups.get(property.propName).propNames;
                            }
                        }
                    }

                    ModelInfos.uniqueInstance.add(entity.entityName, info);
                    if (info.relations) {
                        for (let relation of info.relations) {
                            let rentity = <BaseEntity>ModelFactory.uniqueInstance.create(relation.toLowerCase());
                            if (rentity)
                                this.readEntityInfo(rentity);
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
        this.executeFilter();
    }

    onApply() {
        this.package.row_current_page = 0;
        this.executeFilter(true);
    }

    onSelectPage(index) {
        this.package.row_current_page = index;
        this.executeFilter();
    }

    onNextPage() {

        this.package.row_current_page++;
        this.executeFilter();
    }

    onPreviousPage() {

        this.package.row_current_page--;
        this.executeFilter();
    }

    executeFilter(count?: boolean) {
        if (!count)
            count = false;
        this.loadEntitiesByFilter(
            this.package.filter,
            count,
            (entities_count, entities) => {
                if (entities) {
                    this.package.rows = entities;
                }
                else {
                    let pages = (entities_count) / this.package.row_page_max;
                    this.package.row_pages = new Array<number>(toInteger(pages));
                }
            },
            () => { this.package.show_filter = true; });
    }

    executeLookupFilter(count?: boolean) {
        if (!count)
            count = false;
        this.loadEntitiesByFilter(
            this.package.lookup_filter,
            count,
            (entities_count, entities) => {
                if (entities) {
                    this.package.lookup_rows = entities
                }
                else {
                    let pages = (entities_count) / this.package.row_page_max;
                    this.package.lookup_row_pages = new Array<number>(toInteger(pages));
                }

            },
            () => { });
    }

    onSelectEntity(entity: T) {

        this.package.selected_entity = entity;
        this.package.entity_status_msg = '';
        this.package.error_msg = '';

        this.readPackageEntity(entity);
    }

    private readPackageEntity(entity: T, cb?: () => void) {
        this.readEntitiesByUkey(entity.entityInfo,
            null, entity.uid, null,
            (entities_count, entities) => {
                this.package.entity = entities[0];
                this.package.show_filter = false;

                if (entity.entityInfo.relations) {
                    for (let relation of entity.entityInfo.relations) {
                        let relation_entityInfo = ModelInfos.uniqueInstance.get(relation);
                        this.readEntitiesByUkey(relation_entityInfo,
                            null, entity[this.package.entity.ukeyPropName], relation,
                            (entities_count, entities) => {
                                this.package.entity[relation + '_relation'] = entities;
                            }, () => { this.package.show_filter = true; });
                    }
                }

                if (cb)
                    cb();
            }, () => { this.package.show_filter = true; });
    }

    loadEntitiesByFilter(filter: BaseEntity,
        count: boolean,
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        let entityInfo = filter.entityInfo;
        let count_query = undefined;
        if (count === true) {
            count_query = filter.toCountFilter();
            this.httpCaller.callPost(
                '/sheetdata/getscalar',
                {
                    spreadsheetName: entityInfo.spreadsheetName,
                    sheetName: entityInfo.sheetName,
                    entityName: entityInfo.entityName,
                    select: count_query
                },
                result => {
                    let rows_count = result.scalar;
                    cb(rows_count, null);
                    this.readEntitiesByUkey(entityInfo, filter, null, null, cb, cerr);
                },
                err => {
                    this.package.error_msg = 'Connection error! ' + this.getError(err);
                });

        }
        else {
            this.readEntitiesByUkey(entityInfo, filter, null, null, cb, cerr);
        }
    }

    private readEntitiesByUkey(entityInfo: IEntityInfo, filter: BaseEntity, ukey: any, relation: string,
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        let query = undefined;
        if (relation) {
            query = BaseEntity.toFKeyFilter(entityInfo, this.package.entity.ukeyPropName, ukey);
        }
        else if (ukey) {
            query = BaseEntity.toUKeyFilter(entityInfo, ukey);
        }
        else {
            let offset = 0;
            if (filter === this.package.filter)
                offset = this.package.row_current_page * this.package.row_page_max;
            else
                offset = this.package.lookup_row_current_page * this.package.row_page_max;
            let limit = this.package.row_page_max;
            query = BaseEntity.toFilter(filter, offset, limit);
        }


        this.httpCaller.callPost('/sheetdata/select',
            {
                spreadsheetName: entityInfo.spreadsheetName,
                sheetName: entityInfo.sheetName,
                entityName: entityInfo.entityName,
                select: query,
                addSchema: false
            },
            result => {
                let rows = result.rows as Array<any>;
                if (rows) {
                    let entities = [];
                    for (let row of rows) {
                        let entity = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(entityInfo.entityName), row);
                        entity.status = eEntityStatus.Loaded;
                        entities.push(entity)
                    }
                    cb(undefined, entities);
                }
            },
            err => {

                this.showAlert('Connection error! ' + this.getError(err));
                cerr();
            });

    }

    onNew() {
        this.package.entity = BaseEntity.createInstance(this.type);
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

        this.saveEntity(this.package.entity, () => {
            if (this.package.entity.status === eEntityStatus.Loaded)
                Object.assign(this.package.selected_entity, this.package.entity);
            this.package.entity_status_msg = 'Entity saved.';

            this.readPackageEntity(this.package.entity, () => { this.package.entity_status_msg = 'Entity saved & refetched.'; });
        });
    }

    private getEntitySaveCallPack(entity: BaseEntity) {
        let url = '';
        if (entity.status === eEntityStatus.Loaded || entity.status === eEntityStatus.Updated)
            url = '/sheetdata/update';
        else if (entity.status === eEntityStatus.New)
            url = '/sheetdata/create';
        else if (entity.status === eEntityStatus.Deleted)
            url = '/sheetdata/delete';

        let entityInfo = entity.entityInfo;
        if (entity.status === eEntityStatus.Deleted)
            return [url,
                {
                    spreadsheetID: entityInfo.spreadsheetID,
                    sheetName: entityInfo.sheetName,
                    sheetID: entityInfo.sheetID,
                    ID: entity.uid,
                    rowid: entity.rowid
                }];
        else
            return [url,
                {
                    spreadsheetID: entityInfo.spreadsheetID,
                    sheetName: entityInfo.sheetName,
                    sheetID: entityInfo.sheetID,
                    values: entity.toArray()
                }];

    }

    private saveEntity(entity: BaseEntity, cb?: () => void) {
        let entityInfo = entity.entityInfo;
        let packs = [];
        packs.push(this.getEntitySaveCallPack(entity));
        if (entityInfo.relations) {
            for (let relation of entityInfo.relations) {
                if (this.package.entity[relation + '_relation']) {
                    for (let rentity of this.package.entity[relation + '_relation']) {
                        if (rentity.status === eEntityStatus.Updated || rentity.status === eEntityStatus.New)
                            packs.push(this.getEntitySaveCallPack(rentity));
                    }
                }
                if (this.package.entity[relation + '_relation_deleted']) {
                    for (let rentity of this.package.entity[relation + '_relation_deleted']) {
                        packs.push(this.getEntitySaveCallPack(rentity));
                    }
                }
            }
        }

        this.httpCaller.callPosts(
            packs,
            result => {
                if (cb)
                    cb();
            },
            err => {
                this.package.error_msg += this.getError(err);
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


        this.deleteEntity(this.package.entity, () => {
            let index = this.package.rows.indexOf(this.package.selected_entity);
            this.package.rows = this.package.rows.splice(index, 1);
            this.package.entity_status_msg = 'Entity deleted.';
        });

    }

    private deleteEntity(entity: BaseEntity, cb?: () => void) {

        entity.status = eEntityStatus.Deleted;
        let entityInfo = entity.entityInfo;

        this.httpCaller.callPost('/sheetdata/delete',
            {
                spreadsheetID: entityInfo.spreadsheetID,
                sheetName: entityInfo.sheetName,
                sheetID: entityInfo.sheetID,
                ID: entity.uid,
                rowid: entity.rowid
            },
            result => {

                if (entityInfo.relations) {
                    for (let relation of entityInfo.relations) {
                        if (this.package.entity[relation + '_relation']) {
                            for (let rentity of this.package.entity[relation + '_relation']) {
                                this.deleteEntity(rentity);
                            }
                        }
                        if (this.package.entity[relation + '_relation_deleted']) {
                            for (let rentity of this.package.entity[relation + '_relation_deleted']) {
                                this.deleteEntity(rentity);
                            }
                        }
                    }
                }

                if (cb)
                    cb();

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

        this.readPackageEntity(
            this.package.entity,
            () => {
                this.package.entity_status_msg = 'Entity restored.'
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

        const modalRef = this.modalService.open(AlertDialogWnd);
        modalRef.componentInstance.message = message;
    }

    private askYesNo(message: string) {

        const modalRef = this.modalService.open(AskDialogWnd);
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    private openEditDialog(title: string) {

        const modalRef = this.modalService.open(EditEntityDialogWnd);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.package = this.package;
        modalRef.componentInstance.packageCtrl = this;
        return modalRef.result;
    }



    isDisabled(entity, property) {
        if (entity === undefined || entity.status === eEntityStatus.Deleted) {
            return true;
        }
        else {
            return false;
        }
    }

    isVisible(property: IPropInfo, entityParent: T, entity: BaseEntity) {
        if (property === undefined
            || (property.propName === 'uid' || property.propName === 'rowid')
            || (entityParent && entityParent.ukeyPropName === property.propName)) {
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
                if (this.isVisible(p, undefined, this.package.filter))
                    this.filter_properties.push(p);
            }
        }
        return this.filter_properties;
    }

    public getRelationProperties(relation: string) {
        let info = ModelInfos.uniqueInstance.get(relation.toLowerCase());
        let properties = [];
        for (let property of info.properties) {
            if (property.propName === 'uid' || property.propName === 'rowid'
                || property.propName === this.package.entity.ukeyPropName)
                continue;
            properties.push(property);
        }
        return properties;
    }

    public onCreateEntityByRelation(relation: string) {

        this.package.entity_relation = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(relation), undefined, false, this.package.entity);
        this.package.entity_relation.status = eEntityStatus.New;
        this.openEditDialog('New: ' + relation).then(result => {
            if (result === 'Save') {
                this.package.entity[relation + '_relation'].push(this.package.entity_relation);
            }
            else {
                this.package.entity_relation = undefined;
            }
        });

    }

    public onEditEntityByRelation(entity: BaseEntity, relation: string) {
        let index = this.package.entity[relation + '_relation'].indexOf(entity);
        this.package.entity_relation = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(relation), entity, true);
        this.openEditDialog('Edit: ' + relation).then(result => {
            if (result === 'Save') {
                this.package.entity_relation.status = eEntityStatus.Updated;
                this.package.entity[relation + '_relation'][index] = this.package.entity_relation;
            }
            else {
                this.package.entity_relation = undefined;
            }
        });


    }

    public onDeleteEntityByRelation(entity: BaseEntity, relation: string) {
        this.askYesNo('Delete item').then(result => {
            if (result === 'Yes') {
                let index = this.package.entity[relation + '_relation'].indexOf(entity);
                this.package.entity[relation + '_relation'].splice(index, 1);
                if (this.package.entity_relation.status === eEntityStatus.Loaded) {
                    this.package.entity_relation.status = eEntityStatus.Deleted;
                    this.package.entity[relation + '_relation_deleted'].push(entity);
                }

            }
        });

    }



    openLookupWnd(lookupProperty: IPropInfo) {
        let entityInfo = ModelInfos.uniqueInstance.get(lookupProperty.lookup_entity_name);
        let properties = lookupProperty.lookup_properties;
        this.package.lookup_filter = ModelFactory.uniqueInstance.create(lookupProperty.lookup_entity_name);

        const modalRef = this.modalService.open(SelectEntityDialogWnd, { size: 'lg' });
        modalRef.componentInstance.title = "select: " + entityInfo.entityName;
        modalRef.componentInstance.lookupEntity = this.package.lookup_filter;
        modalRef.componentInstance.lookupProperties = properties;
        modalRef.componentInstance.package = this.package;
        modalRef.componentInstance.packageCtrl = this;
        return modalRef.result;
    }

    public lookupProperties(lookupEntity: BaseEntity, lookupProperties: string[]) {

        let entityInfo: IEntityInfo = lookupEntity.entityInfo;
        let properties = [];
        for (let property of entityInfo.properties) {
            if (lookupProperties.includes(property.propName)) {
                properties.push(property);
            }
        }
        return properties;
    }

    public getInputType(dataType: string) {
        switch (dataType) {
            case 'NUMBER':
                return 'number';
            case 'TEXT':
                return 'text';
            case 'DATE':
                return 'date';
            case 'TIME':
                return 'time';
        }
    }
}
