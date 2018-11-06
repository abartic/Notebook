import { IEntityPackage } from './../../../../server/common/select-obj';

import { SelectEntityDialogWnd } from './../../dialog/selectEntityDialog/selectEntityDialogWnd';
import { ModelInfos } from './../../../../server/models/modelProperties';
import { ModelFactory } from './../../../../server/models/modelFactory';
import { HttpCallerService } from './../../services/httpcaller.service';
import { BaseEntity, IPropInfo, IEntityInfo, eEntityStatus, eEntityAction } from './../../../../server/models/base-entity';
import { Package } from './package';
import { Input, Inject, Injectable } from '@angular/core';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { AlertDialogWnd } from '../../dialog/alertDialog/alertDialogWnd';
import { AskDialogWnd } from '../../dialog/askDialog/askDialogWnd';
import { NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { EditEntityDialogWnd } from '../../dialog/editEntityDialog/editEntityDialogWnd';
import { KeyedCollection } from '../../../../server/utils/dictionary';
import { ISelectObj } from '../../../../server/common/select-obj';
import { ReportDialogWnd } from '../../dialog/reportDialog/reportDialogWnd';
import { Observable } from 'rxjs/Observable';
import { CalendarDialogWnd } from '../../dialog/calendarDialog/calendarDialogWnd';
import { UserSession } from '../../app.component';
import { eFieldDataType } from '../../../../server/common/enums';



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

    onPrint();

    onCustomCommand(command);

    openLookupWnd(lookupSource: BaseEntity, lookupSourceProperty: IPropInfo);

    package;

    filterProperties;

    entityType: string;

    package_initialized: boolean;

    lookupProperties(lookupEntity: BaseEntity, lookupProperties: string[]);

    getRelationProperties(entity: BaseEntity, relation: string, addLookups: boolean);

    onCreateEntityByRelation(relation: string, validation?: () => boolean, cb?: () => void);

    onEditEntityByRelation(entity: BaseEntity, relation: string, validation?: () => boolean, cb?: () => void)

    isDisabled(entity, property);

    userSession: UserSession;

    setPivotData(cb: (data: Array<any>, slice) => void);


}

export class PackageController<T extends BaseEntity> implements IPackageController {
    userSession: UserSession;

    public package: Package<T>;
    public package_initialized: boolean = undefined;

    constructor(
        public entityType: string,
        private type: new () => T,
        private modalService: NgbModal,
        private httpCaller: HttpCallerService) {

        this.package = new Package<T>(type);
    }

    public fetchEntityInfo() {
        let entity = this.package.filter;
        return this.readEntityInfo(entity)
            .then(info => {
                let calls = [];
                if (info.relations) {
                    for (let relation of info.relations) {
                        let rentity = <BaseEntity>ModelFactory.uniqueInstance.create(relation.toLowerCase());
                        if (rentity) {
                            calls.push(this.readEntityInfo(rentity));

                            if (rentity.entityLookups && rentity.entityLookups.size > 0) {
                                for (let lvalue of Array.from(rentity.entityLookups.values())) {
                                    let lentity = <BaseEntity>ModelFactory.uniqueInstance.create(lvalue.entityName.toLowerCase());
                                    if (lentity)
                                        calls.push(this.readEntityInfo(lentity));
                                }
                            }
                        }
                    }
                }

                if (entity.entityLookups && entity.entityLookups.size > 0) {
                    for (let lvalue of Array.from(entity.entityLookups.values())) {
                        let lentity = <BaseEntity>ModelFactory.uniqueInstance.create(lvalue.entityName.toLowerCase());
                        if (lentity)
                            calls.push(this.readEntityInfo(lentity));
                    }
                }

                if (calls.length > 0)
                    return Promise.all(calls);
                else
                    return Promise.resolve([]);
            }).then((r) => {
                this.package.filter_details = {};
                for (let relation of this.package.filter.entityInfo.relations) {
                    let entity_relation = ModelFactory.uniqueInstance.create(relation);
                    this.package.filter_details[relation] = entity_relation;
                }
                this.package_initialized = true;
            });
    }

    private readEntityInfo(entity: BaseEntity) {
        return new Promise<IEntityInfo>((cb, err_cb) => {
            this.httpCaller.callPost(
                '/sheetdata/spreadsheet-info',

                {
                    spreadsheetName: entity.spreadsheetName,
                    sheetName: entity.sheetName,
                    entityName: entity.entityName
                },
                result => {
                    let info = null;
                    if (result.error === undefined) {
                        info = <IEntityInfo>result;

                        if (entity.entityLookups) {
                            for (let property of info.properties) {
                                if (entity.entityLookups.has(property.propName)) {
                                    property.lookup_entity_name = entity.entityLookups.get(property.propName).entityName;
                                    property.lookup_properties = entity.entityLookups.get(property.propName).propNames;
                                }
                            }
                        }

                        ModelInfos.uniqueInstance.add(entity.entityName, info);
                    }
                    cb(info);
                },
                err => {

                    err_cb(err);
                    this.package.error_msg = 'Connection error! ' + this.getError(err);
                },
                true);
        });
    }

    onClear() {
        if (this.package.filter) {
            this.package.filter.clearFilter();
            for (let relation of this.package.filter.entityInfo.relations)
                this.package.filter_details[relation].clearFilter();
        }
        this.package.row_current_page = 0;
        this.executeFilter(true);
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
        this.package.error_msg = '';
        this.package.filter_loading = true;
        this.loadEntitiesByFilter(
            this.package.filter, this.package.filter_details,
            count,
            (entities_count, entities) => {
                if (entities) {
                    this.package.rows = entities;
                }
                else {
                    let pages = (entities_count) / this.package.row_page_max;
                    this.package.row_pages = new Array<number>(toInteger(pages));
                }
                this.package.filter_loading = false;
            },
            () => {
                this.package.show_filter = true;
                this.package.filter_loading = false;
            });
    }

    executeLookupFilter(count?: boolean) {
        this.package.lookup_loading = true;
        this.package.lookup_rows = [];

        if (!count)
            count = false;
        this.loadEntitiesByFilter(
            this.package.lookup_filter, null,
            count,
            (entities_count, entities) => {

                if (entities) {
                    this.package.lookup_rows = entities;
                }
                else {
                    let pages = (entities_count) / this.package.row_page_max;
                    this.package.lookup_row_pages = new Array<number>(toInteger(pages));
                }
                this.package.lookup_loading = false;
            },
            () => {

                this.package.lookup_loading = false;
            });
    }

    onSelectEntity(entity: T) {
        //if view do not open edit mode
        if (entity.entityInfo.isView === true)
            return;

        this.package.selected_entity = entity;
        this.package.entity_status_msg = '';
        this.package.error_msg = '';

        this.readPackageEntity(entity);
    }

    private readPackageEntity(entity: T, cb?: () => void) {
        this.readEntitiesByUkey(entity.entityInfo,
            null, null, entity.uid, null, null,
            (entities_count, entities) => {
                this.package.entity = entities[0];
                this.package.validations = new KeyedCollection<ISelectObj>();
                this.package.show_filter = false;

                this.readEntityLookups(this.package.entity);

                if (entity.entityInfo.relations) {
                    for (let relation of entity.entityInfo.relations) {
                        let relation_entityInfo = ModelInfos.uniqueInstance.get(relation);
                        this.readEntitiesByUkey(relation_entityInfo, null,
                            null, entity[this.package.entity.ukeyPropName], null, relation,
                            (entities_count, entities) => {
                                this.package.entity[relation + '_relation'] = entities;
                                for (let entity of entities) {
                                    this.readEntityLookups(entity);
                                }
                            },
                            () => { this.package.show_filter = true; });
                    }
                }

                if (cb)
                    cb();
            }, () => { this.package.show_filter = true; });
    }

    private readEntityLookups(entity: BaseEntity) {
        for (let prop of entity.properties) {
            if (prop.lookup_entity_name) {
                let lookup_entityInfo = ModelInfos.uniqueInstance.get(prop.lookup_entity_name);
                this.readEntitiesByUkey(lookup_entityInfo, null,
                    null, null, [prop.lookup_properties[0], entity[prop.propName]], null,
                    (lk_entities_count, lk_entities) => {
                        if (lk_entities && lk_entities.length > 0)
                            entity[prop.lookup_entity_name + '_lookup_entity'] = lk_entities[0];
                    },
                    null);
            }
        }
    }

    executeDetailFilterQuery(filter: BaseEntity, parent: BaseEntity) {
        let promise = new Promise((result, reject) => {
            let entityInfo: IEntityInfo = filter.entityInfo;
            let query = BaseEntity.toFilter(filter, null, null, null, parent.ukeyPropName);
            if (query === null) {
                return result([]);
            }

            this.httpCaller.callPost('/sheetdata/select',
                {
                    spreadsheetName: entityInfo.spreadsheetName,
                    sheetName: entityInfo.sheetName,
                    entityName: entityInfo.entityName,
                    select: query,
                    addSchema: false
                },
                r => {
                    let rows = r.rows as Array<any>;
                    let ukeys = [];
                    if (rows) {
                        let entities = [];
                        for (let row of rows) {
                            let ukey = row[parent.ukeyPropName]
                            ukeys.push(ukey);
                        }
                    }
                    return result(ukeys);
                },
                err => {
                    reject(err);
                });
        });
        return promise;
    }

    executeCountQuery(filter: BaseEntity, keys?) {

        let promise = new Promise((result: (number) => void, reject) => {
            let entityInfo: IEntityInfo = filter.entityInfo;
            let count_query = filter.toCountFilter(keys);
            if (!count_query)
                return null;

            this.httpCaller.callPost(
                '/sheetdata/getscalar',
                {
                    spreadsheetName: entityInfo.spreadsheetName,
                    sheetName: entityInfo.sheetName,
                    entityName: entityInfo.entityName,
                    select: count_query
                },
                r => {
                    let rows_count: number = r.scalar;
                    return result(rows_count);

                },
                err => {
                    reject(err);
                });

        });
        return promise;
    }

    async loadEntitiesByFilter(filter: BaseEntity,
        filter_details,
        count: boolean,
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        let entityInfo = filter.entityInfo;
        let keys = [];
        if (filter_details && entityInfo.relations) {
            for (let relation of entityInfo.relations) {
                await this.executeDetailFilterQuery(filter_details[relation], filter)
                    .then(ukeys => {
                        keys = keys.concat(ukeys);
                        if (keys.length === 0) {
                            this.package.rows = [];

                        }
                    })
                    .catch(err => {
                        this.package.error_msg = this.getError(err);
                        this.package.rows = [];
                        cerr();

                    });
            }
            if (keys.length == 0 && this.package.isDetailsFilterCollapsed === false) {
                cb(0, null);
                return;
            }
        }



        keys = Array.from(new Set(keys));

        if (count === true) {
            await this.executeCountQuery(filter, keys)
                .then(count => {
                    cb(count, null);
                    if (count > 0)
                        this.readEntitiesByUkey(entityInfo, keys, filter, null, null, null, cb, cerr);
                    else
                        this.package.rows = [];
                })
                .catch(err => {
                    this.package.error_msg = this.getError(err);
                    cerr();
                });
        }
        else {
            this.readEntitiesByUkey(entityInfo, keys, filter, null, null, null, cb, cerr);
        }
    }

    private readEntitiesByUkey(entityInfo: IEntityInfo,
        keys,
        filter: BaseEntity,
        uid: any,
        ukey: [string, any],
        relation: string,
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        let query = undefined;
        if (relation) {
            query = BaseEntity.toFKeyFilter(entityInfo, this.package.entity.ukeyPropName, uid, this.package.entity['relation_prop_' + relation + '_relation']);
        }
        else if (ukey) {
            query = BaseEntity.toUKeyFilter(entityInfo, ukey[0], ukey[1]);
        }
        else if (uid) {
            query = BaseEntity.toUIDFilter(entityInfo, uid);
        }
        else {
            let offset = 0;
            if (filter === this.package.filter)
                offset = this.package.row_current_page * this.package.row_page_max;
            else
                offset = this.package.lookup_row_current_page * this.package.row_page_max;
            let limit = this.package.row_page_max;
            query = BaseEntity.toFilter(filter, keys, offset, limit);
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
                        let entity = BaseEntity.createInstance(
                            ModelFactory.uniqueInstance.get(entityInfo.entityName),
                            row,
                            false,
                            null);
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
        this.package.entity = BaseEntity.createInstance(this.type, null, false, null);
        this.package.validations = new KeyedCollection<ISelectObj>();
        this.package.entity.status = eEntityStatus.New;
        this.package.entity_status_msg = '';
        this.package.error_msg = '';
        this.package.show_filter = false;
    }

    onSave() {

        this.clearMsg(false);
        if (this.package.entity.status === eEntityStatus.Deleted) {
            this.showAlert('Entity deleted already!');
            return;
        }

        let action = eEntityAction.None;
        if (this.package.entity.status === eEntityStatus.New)
            action = eEntityAction.Create;
        else
            action = eEntityAction.Update;

        this.package.entity.onPrepareSave();
        this.validateEntity((validationResult) => {

            if (validationResult && validationResult.length > 0) {
                this.showAlert("Invalid fields:" + validationResult);
                return;
            }

            this.saveEntity(action, this.package.entity, () => {
                if (this.package.entity.status === eEntityStatus.Loaded)
                    Object.assign(this.package.selected_entity, this.package.entity);
                this.package.entity_status_msg = 'Entity saved.';

                this.readPackageEntity(this.package.entity, () => { this.package.entity_status_msg = 'Entity saved & refetched.'; });
            });
        });
    }

    private getEntitySaveCallPack(action: eEntityAction, entity: BaseEntity) {

        let entityInfo = entity.entityInfo;
        let select = BaseEntity.getFilterByUID(entity);
        if (action === eEntityAction.Delete) {
            return <IEntityPackage>{
                sheetName: entityInfo.sheetName,
                sheetID: entityInfo.sheetID,
                ID: entity.uid,
                rowid: entity.rowid,
                selectEntity: select,
                action: action
            };
        }
        else {
            return <IEntityPackage>{
                sheetName: entityInfo.sheetName,
                sheetID: entityInfo.sheetID,
                ID: entity.uid,
                values: entity.toArray(),
                selectEntity: select,
                action: action
            };
        }

    }

    private validateEntity(cb?: (validationResult) => void) {
        let packs = [];
        if (this.package.validations.Count() === 0) {
            if (cb)
                cb(null);
        }

        for (let validation_item of this.package.validations.Values()) {
            packs.push(
                ['/sheetdata/validate', validation_item]
            );
        }

        this.httpCaller.callPosts(
            packs,
            result => {
                if (cb)
                    cb(result);
            },
            err => {
                this.package.error_msg = this.getError(err);
            });
    }

    private saveEntity(action: eEntityAction, entity: BaseEntity, cb?: () => void) {
        let entityInfo = entity.entityInfo;
        let packs = [];
        if (entityInfo.relations) {
            for (let relation of entityInfo.relations) {
                if (this.package.entity[relation + '_relation']) {
                    for (let rentity of this.package.entity[relation + '_relation']) {
                        let raction = eEntityAction.None;

                        if (action === eEntityAction.Delete && (rentity.status === eEntityStatus.Loaded
                            || rentity.status === eEntityStatus.Updated)) {
                            raction = eEntityAction.Delete;
                        }
                        if (action === eEntityAction.Create) {
                            raction = eEntityAction.Create;
                        }
                        else if (action === eEntityAction.Update) {
                            if (rentity.status === eEntityStatus.Updated)
                                raction = eEntityAction.Update;
                            else if (rentity.status === eEntityStatus.New)
                                raction = eEntityAction.Create;
                        }

                        if (raction !== eEntityAction.None)
                            packs.push(this.getEntitySaveCallPack(raction, rentity));
                    }
                }
                if (action !== eEntityAction.Create && this.package.entity[relation + '_relation_deleted']) {
                    for (let rentity of this.package.entity[relation + '_relation_deleted']) {
                        packs.push(this.getEntitySaveCallPack(eEntityAction.Delete, rentity));
                    }
                }
            }
        }
        packs.push(this.getEntitySaveCallPack(action, entity));

        let url = '';
        if (action === eEntityAction.Update)
            url = '/sheetdata/update';
        else if (action === eEntityAction.Create)
            url = '/sheetdata/create';
        else if (action === eEntityAction.Delete)
            url = '/sheetdata/delete';

        this.httpCaller.callPost(
            url,
            {
                spreadsheetID: entityInfo.spreadsheetID,
                spreadsheetName: entityInfo.spreadsheetName,
                entityPackages: packs,
                action: action
            },
            result => {
                if (cb)
                    cb();
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

        this.saveEntity(eEntityAction.Delete, this.package.entity, () => {
            this.package.entity.status = eEntityStatus.Deleted;
            let index = this.package.rows.indexOf(this.package.selected_entity);
            this.package.rows = this.package.rows.splice(index, 1);
            this.package.entity_status_msg = 'Entity deleted.';
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

    private showReport(reportUrl: string) {

        const modalRef = this.modalService.open(ReportDialogWnd,
            { windowClass: 'report-modal' }
        );
        modalRef.componentInstance.reportUrl = reportUrl;
    }

    private askYesNo(message: string) {

        const modalRef = this.modalService.open(AskDialogWnd);
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    private openEditDialog(title: string, validation?: () => boolean, relation?) {

        const modalRef = this.modalService.open(EditEntityDialogWnd);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.package = this.package;
        modalRef.componentInstance.packageCtrl = this;
        modalRef.componentInstance.validationFunc = validation;
        modalRef.componentInstance.relation = relation;
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

    isVisible(property: IPropInfo, entityParent: T, entity: BaseEntity, forFilter?: boolean) {
        if (property === undefined
            || (property.propName === 'uid' || property.propName === 'rowid')
            || (entityParent && entityParent.ukeyPropName === property.propName)
            || (forFilter && property.isFilterHidden)
            || (property.isHidden === true)) {
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
                if (this.isVisible(p, undefined, this.package.filter, true))
                    this.filter_properties.push(p);
            }
            for (let p of this.package.filter.getShellInfo().filter.fields.add) {
                p.isCustom = true;
                this.filter_properties.push(p);

            }
        }


        return this.filter_properties;
    }

    //private entity_properties: IPropInfo[] = [];
    // public get entityProperties() {

    //     if (this.package.entity === undefined || this.package.entity.properties === undefined)
    //         return this.entity_properties;

    //     if (this.entity_properties.length == 0) {
    //         this.entity_properties.concat(this.package.entity.properties)

    //         for (let prop of this.package.entity.getShellInfo().properties) {
    //             this.entity_properties.push(<IPropInfo>{
    //                 propName: prop.name,
    //                 path: null,
    //                 cellName: null,
    //                 dataType: prop.datatype,
    //                 mask: this.getMask(prop.datatype),
    //                 isHidden: false,
    //                 isReadOnly: prop.isReadOnly,
    //                 isCustom: true
    //             })
    //         }
    //     }
    //     return this.entity_properties;
    // }

    // private getMask(dataType) {
    //     let mask = '';
    //     if (dataType === eFieldDataType.Numeric) {
    //         mask = "#,##0.00"
    //     }
    //     else if (dataType === eFieldDataType.Integer) {
    //         mask = "#,##0"
    //     }
    //     else if (dataType === eFieldDataType.Date) {
    //         mask = "dd/MM/yyyy"
    //     }
    //     return mask;
    // }

    public getRelationProperties(entity: BaseEntity, relation: string, addLookups: boolean) {
        let properties = [];
        let info = ModelInfos.uniqueInstance.get(relation.toLowerCase());
        if (!info.properties)
            return properties;

        for (let property of info.properties) {
            if (property.propName === 'uid' || property.propName === 'rowid'
                || property.propName === entity.ukeyPropName || property.isHidden === true)
                continue;

            properties.push(property);

            if (property.lookup_entity_name && addLookups === true)
                properties.push(<IPropInfo>{
                    propName: property.lookup_properties[1],
                    propCaption: property.lookup_properties[1],
                    path: property.lookup_entity_name + '_lookup_entity',
                    dataType: 's'
                });
        }
        return properties;
    }

    public onCreateEntityByRelation(relation: string, validation?: () => boolean, cb?: () => void) {

        this.package.entity_relation = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(relation), null,
            false, this.package.entity);
        this.package.entity_relation.status = eEntityStatus.New;
        this.openEditDialog('New: ' + relation, validation, relation).then(result => {
            if (result === 'Save') {
                if (!this.package.entity[relation + '_relation'])
                    this.package.entity[relation + '_relation'] = [];
                this.package.entity[relation + '_relation'].push(this.package.entity_relation);
            }
            else {
                this.package.entity_relation = undefined;
            }

            cb();

        }, (reason) => {
            this.package.entity_relation = undefined;
        });

    }

    public onEditEntityByRelation(entity: BaseEntity, relation: string, validation?: () => boolean, cb?: () => void) {
        let index = this.package.entity[relation + '_relation'].indexOf(entity);
        this.package.entity_relation = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(relation),
            entity, true, null);
        this.package.entity_relation.status = eEntityStatus.None;
        this.openEditDialog('Edit: ' + relation, validation, relation).then(result => {
            if (result === 'Save') {
                if (this.package.entity_relation.status !== eEntityStatus.New)
                    this.package.entity_relation.status = eEntityStatus.Updated;
                this.package.entity[relation + '_relation'][index] = this.package.entity_relation;
            }
            else if (result === 'Delete') {
                this.onDeleteEntityByRelation(entity, relation, true);
            }
            else {
                this.package.entity_relation = undefined;
            }

            cb();

        }, (reason) => {
            this.package.entity_relation = undefined;
        });


    }

    public onDeleteEntityByRelation(entity: BaseEntity, relation: string, silent?: boolean) {
        let deleteaction = () => {
            let index = this.package.entity[relation + '_relation'].indexOf(entity);
            this.package.entity[relation + '_relation'].splice(index, 1);
            if (entity.status !== eEntityStatus.New) {
                entity.status = eEntityStatus.Deleted;
                if (this.package.entity[relation + '_relation_deleted'] === undefined)
                    this.package.entity[relation + '_relation_deleted'] = [];
                this.package.entity[relation + '_relation_deleted'].push(entity);
            }
        };

        if (silent === true) {
            deleteaction();
        }
        else {
            this.askYesNo('Delete item').then(result => {
                if (result === 'Yes') {
                    deleteaction();
                }
            }, (reason) => {

            });
        }
    }



    openLookupWnd(lookupSource: BaseEntity, lookupSourceProperty: IPropInfo) {

        this.package.lookup_row_current_page = 0;
        this.package.lookup_rows = []
        this.package.lookup_row_pages = [];


        let entityInfo = ModelInfos.uniqueInstance.get(lookupSourceProperty.lookup_entity_name);
        let properties = lookupSourceProperty.lookup_properties;
        this.package.lookup_filter = ModelFactory.uniqueInstance.create(lookupSourceProperty.lookup_entity_name);

        const modalRef = this.modalService.open(SelectEntityDialogWnd, { size: 'lg' });
        modalRef.componentInstance.title = "select: " + entityInfo.entityName;
        modalRef.componentInstance.lookupSource = lookupSource;
        modalRef.componentInstance.lookupSourceProperty = lookupSourceProperty.propName;
        modalRef.componentInstance.lookupEntity = this.package.lookup_filter;
        modalRef.componentInstance.lookupTargetProperty = lookupSourceProperty.lookup_properties[0];

        modalRef.componentInstance.lookupProperties = properties;
        modalRef.componentInstance.package = this.package;
        modalRef.componentInstance.packageCtrl = this;
        return modalRef.result.then((result) => {

        }, (reason) => {

        });
    }

    public lookupProperties(lookupEntity: BaseEntity, lookupProperties: string[]) {

        let entityInfo: IEntityInfo = lookupEntity.entityInfo;
        let properties = [];
        for (let property of entityInfo.properties) {
            if (property.isHidden !== true && lookupProperties.includes(property.propName)) {
                properties.push(property);
            }
        }
        return properties;
    }

    onSelectLookup(lookupSource: BaseEntity, lookupSourceProperty: string, lookupEntity: BaseEntity, lookupTargetProperty: string) {

        lookupSource[lookupEntity.entityName.toLowerCase() + '_lookup_entity'] = lookupEntity;
        lookupSource[lookupSourceProperty] = lookupEntity[lookupTargetProperty];
        this.removeValidation(lookupSource, lookupSourceProperty);
    }

    onLookupFilterChange() {
        this.executeLookupFilter(true);
    }

    public getInputType(property: IPropInfo) {

        if (property.customInputType) {
            return property.customInputType;
        }
        else {
            let dataType: string = property.dataType;
            switch (dataType) {
                case eFieldDataType.Numeric:
                case eFieldDataType.Integer:
                    return 'number';
                case eFieldDataType.Boolean:
                    return 'checkbox';
                case eFieldDataType.Date:
                    return 'date';
                case eFieldDataType.Time:
                    return 'time';
                case eFieldDataType.String:
                default:
                    return 'text';
            }
        }
    }


    onEditorValueChanged(entity: BaseEntity, property: IPropInfo) {

        if (property.dataType === eFieldDataType.Numeric && typeof entity[property.propName] === 'string') {

            entity[property.propName] = Number.parseFloat(entity[property.propName] || "0.0");

        } else if (property.dataType === eFieldDataType.Integer && typeof entity[property.propName] === 'string') {

            entity[property.propName] = Number.parseInt(entity[property.propName] || "0");

        }

        let cascaded_value = false;
        if (entity)
            cascaded_value = entity.onPropValueChanged(property, entity[property.propName]);

        if (entity.ukeyPropName === property.propName || cascaded_value) {
            if (entity.entityInfo.relations) {
                for (let relation of entity.entityInfo.relations) {
                    if (entity[relation + '_relation']) {
                        for (let item of entity[relation + '_relation']) {
                            item[entity.ukeyPropName] = entity[entity.ukeyPropName];
                            if (item.status !== eEntityStatus.New)
                                item.status = eEntityStatus.Updated
                        }
                    }
                }
            }
            this.addValidation(entity, entity.entityName, property.propName);
        }
        else if (property.lookup_entity_name) {
            if (!entity[property.propName] || entity[property.propName].toString().trim().length === 0) {
                this.removeValidation(entity, property.propName);
            }
            else {
                this.addValidation(entity, property.lookup_entity_name, property.propName);
            }
        }


    }
    onEditorFocusChanged(entity: BaseEntity, property: IPropInfo) {
        if (property.lookup_entity_name) {
            if (!entity[property.propName] || entity[property.propName].toString().trim().length === 0) {

                entity[property.lookup_entity_name + '_lookup_entity'] = '';
            }
            else {
                let selectItem = this.getLookupSelect(entity, property.lookup_entity_name, property.propName);

                this.httpCaller.callPost(
                    '/sheetdata/select',
                    selectItem,
                    result => {
                        let entities = result.rows as Array<any>;
                        if (entities && entities.length > 0)
                            entity[property.lookup_entity_name + '_lookup_entity'] = entities[0];
                        else
                            entity[property.lookup_entity_name + '_lookup_entity'] = '';
                    },
                    err => {
                        ;//show error if code wrong
                    });
            }
        }
    }


    addValidation(entity: BaseEntity, lookup_entity_name: string, propName: string) {
        let validation_item: ISelectObj;

        let checkUnique = (entity.entityName === lookup_entity_name);


        let lookup_entity = checkUnique ? entity : ModelFactory.uniqueInstance.create(lookup_entity_name);
        this.removeValidation(entity, propName);
        validation_item = <ISelectObj>{};
        validation_item.spreadsheetName = lookup_entity.spreadsheetName;
        validation_item.sheetName = lookup_entity.sheetName;
        validation_item.select = BaseEntity.getFilterByUKey(lookup_entity, propName, entity[propName], false, checkUnique);
        validation_item.addSchema = false;
        validation_item.checkUnique = checkUnique;
        this.package.validations.Add(entity.uid + propName, validation_item);
        return validation_item;
    }

    getLookupSelect(entity: BaseEntity, lookup_entity_name: string, propName: string) {
        let select_item: ISelectObj;
        let lookup_entity = ModelFactory.uniqueInstance.create(lookup_entity_name);
        select_item = <ISelectObj>{};
        select_item.spreadsheetName = lookup_entity.spreadsheetName;
        select_item.sheetName = lookup_entity.sheetName;
        select_item.select = BaseEntity.getFilterByUKey(lookup_entity, propName, entity[propName], true);
        select_item.addSchema = false;
        return select_item;
    }

    removeValidation(entity: BaseEntity, propName: string) {
        if (this.package.validations.ContainsKey(entity.uid + propName))
            this.package.validations.Remove(entity.uid + propName)
    }

    onPrint() {
        let pack = this.getEntitySaveCallPack(eEntityAction.Update, this.package.entity);
        pack['reportType'] = this.package.entity.entityName.toLocaleLowerCase();

        pack.values = this.package.entity;
        let preloadObs = new Observable((observer) => {

            let packs = this.package.entity.getShellInfo().report.preloads;
            let index = 0;

            if (packs.length === 0) {
                return observer.complete();
            }
            for (let ppack of packs) {
                let p: Promise<IEntityInfo> = null;
                let einfo = ModelInfos.uniqueInstance.get(ppack.entity_name);
                if (!einfo) {
                    let lentity = <BaseEntity>ModelFactory.uniqueInstance.create(ppack.entity_name.toLowerCase());
                    if (lentity)
                        p = this.readEntityInfo(lentity);

                }
                else {
                    p = Promise.resolve(einfo);
                }
                p.then(ei => {
                    let spack: ISelectObj = {
                        spreadsheetName: ei.spreadsheetName,
                        sheetName: ei.sheetName,
                        entityName: ei.entityName,
                        select: BaseEntity.toUKeyFilter(ei, ppack.ukey_prop_name, this.package.entity[ppack.ukey_prop_name]),
                    };

                    this.httpCaller.callPost(
                        '/sheetdata/select',
                        spack,
                        r => {
                            index += 1;
                            let entity = {};
                            if (r.rows && r.rows.length > 0) {
                                //call callback
                                entity = r.rows[0];
                            }
                            ppack.cb(entity);
                            if (index >= packs.length)
                                observer.complete();
                        },
                        err => {
                            observer.error();
                        });
                }).catch((err) => {
                    observer.error();
                })

            }

        });

        preloadObs.subscribe(() => { },
            () => {
                this.package.error_msg = 'report error...';
            },
            () => {
                this.httpCaller.callPdf(
                    '/sheetdata/report  ',
                    pack,
                    reportUrl => {
                        this.showReport(reportUrl);
                    },
                    err => {
                        this.package.error_msg = this.getError(err);
                    });
            })

    }

    public onCustomCommand(command) {
        if (command === 'show_calendar') {
            window.open("https://calendar.google.com/calendar");

        } else if (command === 'print') {
            this.onPrint();
        }
    }

    public setPivotData(cb: (data: Array<any>, slice) => void) {

        setTimeout(() => {
            while (!this.package.entity['budgetline_relation']) { }
            cb(this.package.entity['budgetline_relation'], this.package.entity.getShellInfo().pivotInfo);

        }, 1000);


    }


}
