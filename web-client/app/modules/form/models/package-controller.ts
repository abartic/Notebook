
import { UserSession } from '../../../core/models/userSession';
import { IEntityPackage } from '../../../../../server/common/select-obj';
import { ModelInfos, ShellInfos } from '../../../../../server/models/modelProperties';
import { ModelFactory } from '../../../../../server/models/modelFactory';
import { BaseEntity, IPropInfo, IEntityInfo, eEntityStatus, eEntityAction, IShellInfo } from '../../../../../server/models/base-entity';
import { Package } from './package';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeyedCollection } from '../../../../../server/utils/dictionary';
import { ISelectObj } from '../../../../../server/common/select-obj';
import { Observable } from 'rxjs/Observable';
import { eFieldDataType } from '../../../../../server/common/enums';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IPackageController } from './ipackage-controller';
import { TranslateService } from '@ngx-translate/core';
import { HttpCallerService } from '../../../core';
import { UserSessionService } from '../../../core/services/userSessionService';
import { AlertDialogWnd } from '../../../core/dialogs/alertDialog/alertDialogWnd';
import { ReportDialogWnd } from '../components/reportDialog/reportDialogWnd';
import { AskDialogWnd } from '../../../core/dialogs/askDialog/askDialogWnd';
import { EditEntityDialogWnd } from '../components/editEntityDialog/editEntityDialogWnd';
import { SelectEntityDialogWnd } from '../components/selectEntityDialog/selectEntityDialogWnd';


export class PackageController<T extends BaseEntity> implements IPackageController {
    isLookupExecuting: boolean;


    constructor(
        public entityType: string,
        private type: new () => T,
        private modalService: NgbModal,
        private httpCaller: HttpCallerService,
        private userSessionService: UserSessionService,
        private router: Router,
        private translateService: TranslateService) {

        this.package = new Package<T>(type);
        this.userSessionService.userSession
            .subscribe(
                us => { this.userSession = us; },
                error => {
                    this.router.navigate(['/error', { errorcode: 'User sessions missing. Please re-login!' }]);
                });

        if (this.editor_commands.length === 0) {
            for (const c of this.shellInfo.commands) {
                if (c.handler === 'onNew') {
                    this.package.canExecuteNew = c.isDisabled !== true && (!c.isActive || (c.isActive && c.isActive(this) === true));
                }
                this.editor_commands.push(c);
            }
            this.package.canExecuteFilter = this.shellInfo.filter.selectFirst !== true;

        }


    }
    public get filterProperties() {
        let finfo = ModelInfos.uniqueInstance.get(this.entityType);
        let shellInfo = ShellInfos.uniqueInstance.get(this.entityType);

        if (this.filter_properties.length === 0) {
            for (const p of finfo.properties) {
                if (this.isVisible(p, undefined, true)) {
                    this.filter_properties.push({ property: p, entityName: finfo.entityName });
                }
            }
            for (const p of shellInfo.filter.fields.add) {
                p.isCustom = true;
                this.filter_properties.push({ property: p, entityName: finfo.entityName });

            }

            if (shellInfo.filter.sortFields && shellInfo.filter.sortFields.length > 0) {
                let prop = this.entityInfo.properties.find(p => p.propName === this.shellInfo.filter.sortFields[0]);
                this.package.sortField = { property: prop, entityName: this.entityInfo.entityName };
                this.package.hasFilterResults = false;
            }
        }


        return this.filter_properties;
    }

    filter_sort_properties = [];
    public get filterSortProperties() {
        let einfo = ModelInfos.uniqueInstance.get(this.entityType);
        let shellInfo = ShellInfos.uniqueInstance.get(this.entityType);

        if (shellInfo.filter.sortFields && this.filter_sort_properties.length === 0) {
            for (const sp of shellInfo.filter.sortFields) {
                let prop = einfo.properties.find(p => p.propName === sp)
                if (prop)
                    this.filter_sort_properties.push({ property: prop, entityName: einfo.entityName });
            }
        }
        return this.filter_sort_properties;
    }

    private editor_commands = [];
    public get editorCommands() {


        return this.editor_commands;
    }




    public package: Package<T>;
    public package_initialized = false;
    private userSession = new UserSession();

    public filterItems: { filterCondition: { entityName: string, property: IPropInfo }; filterConditionValue: string; display?: any }[] = [];

    private filter_properties = [];

    public get entityInfo() {
        return ModelInfos.uniqueInstance.get(this.entityType);
    }

    public get shellInfo() {
        return ShellInfos.uniqueInstance.get(this.entityType);
    }

    public fetchEntityInfo(info: IEntityInfo) {

        return this.readEntityInfo(info)
            .then(info => {
                const calls = [];
                if (info.relations) {
                    for (const relation of info.relations) {
                        const r_entityInfo = ModelInfos.uniqueInstance.get(relation.toLowerCase());
                        if (r_entityInfo) {
                            calls.push(this.readEntityInfo(r_entityInfo));

                            if (r_entityInfo.entityLookups && r_entityInfo.entityLookups.size > 0) {
                                for (const lvalue of Array.from(r_entityInfo.entityLookups.values())) {
                                    const l_entityInfo = ModelInfos.uniqueInstance.get(lvalue.entityName.toLowerCase());
                                    if (l_entityInfo) {
                                        calls.push(this.readEntityInfo(l_entityInfo));
                                    }
                                }
                            }
                        }
                    }
                }

                if (info.entityLookups && info.entityLookups.size > 0) {
                    for (const lvalue of Array.from(info.entityLookups.values())) {
                        const l_entityInfo = ModelInfos.uniqueInstance.get(lvalue.entityName.toLowerCase());
                        if (l_entityInfo) {
                            calls.push(this.readEntityInfo(l_entityInfo));
                        }
                    }
                }

                if (calls.length > 0) {
                    return Promise.all(calls);
                }
                else {
                    return Promise.resolve([]);
                }
            }).then((r) => {

                this.package_initialized = true;
                this.onViewLoaded();
            })
            .catch(error => {
                console.log(error);
                if (error && error.status) {
                    this.router.navigate(['/error', { errorcode: error.status }]);
                }
                else if (error && error.error && error.error.code) {
                    this.router.navigate(['/error', { errorcode: error.error.code }]);
                }
                else {
                    this.router.navigate(['/error', { errorcode: JSON.stringify(error) }]);
                }
            });
    }

    private onViewLoaded() {
        if (this.shellInfo.filter.selectFirst === true) {
            this.onApplyFilter();
        }
    }

    private readEntityInfo(info: IEntityInfo) {
        return new Promise<IEntityInfo>((cb, err_cb) => {
            this.httpCaller.callPost(
                '/sheetdata/spreadsheet-info',
                {
                    spreadsheetName: info.spreadsheetName,
                    sheetName: info.sheetName,
                    entityName: info.entityName
                },
                result => {
                    let info = null;
                    if (result.error === undefined) {
                        info = result as IEntityInfo;

                        ModelInfos.uniqueInstance.addOrUpdate(info.entityName, info);
                        info = ModelInfos.uniqueInstance.get(info.entityName);

                        if (info.entityLookups) {
                            for (const property of info.properties) {
                                if (info.entityLookups.has(property.propName)) {
                                    property.lookup_entity_name = info.entityLookups.get(property.propName).entityName;
                                    property.lookup_properties = info.entityLookups.get(property.propName).propNames;
                                }
                            }
                        }
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

    onAddFilterCond(selectedFilterCond: { entityName: string, property: IPropInfo }, filterConditionValue) {
        this.filterItems.push({
            filterCondition: selectedFilterCond,
            filterConditionValue,
            display: selectedFilterCond.property.propName + ': ' + filterConditionValue
        });
    }

    onClear() {
        if (this.filterItems) {
            this.filterItems = []
        }
        this.package.filter_last_index = 0;
        this.package.filter_rows = [];
        this.filter_relation_keys = [];
        this.executeFilter();
    }

    onApplyFilter() {

        this.package.filter_last_index = 0;
        this.package.filter_rows = [];
        this.filter_relation_keys = [];
        this.executeFilter();
    }



    private isFilterExecuting = false;
    executeFilter() {
        if (this.isFilterExecuting === true)
            return;


        this.isFilterExecuting = true;
        this.package.error_msg = '';
        this.setWaiting(true);
        this.loadEntitiesByFilter(
            false,
            (entities_count, entities) => {
                try {
                    if (entities) {
                        this.package.filter_fetch_completed = entities.length !== this.package.fetched_items_max;
                        entities.forEach(item => {
                            this.package.filter_rows.push(item);
                        });
                        this.package.hasFilterResults = true;
                        this.package.filter_last_index = this.package.filter_rows.length;
                    }
                } finally {
                    this.setWaiting(false);
                    this.isFilterExecuting = false;

                    if (this.shellInfo.filter.selectFirst === true && this.package.filter_rows.length > 0) {
                        this.onSelectEntity(this.package.filter_rows[0]);
                    }
                }
            },
            () => {
                this.isFilterExecuting = false;
                this.package.show_filter = true;
                this.setWaiting(false);
            });
    }



    executeLookupFilter(lookup_entity_name: string, filterItems, reset: boolean, cb: () => void) {
        if (this.isLookupExecuting === true)
            return;

        if (reset === true) {
            this.package.lookup_last_index = 0;
            this.package.lookup_rows.length = 0;
        }

        this.isLookupExecuting = true;
        this.package.lookup_loading = true;

        const shellInfo = ShellInfos.uniqueInstance.get(lookup_entity_name);
        const entityInfo = ModelInfos.uniqueInstance.get(lookup_entity_name);
        this.loadLookupEntitiesByFilter(
            shellInfo, entityInfo, filterItems,
            (entities_count, entities) => {

                try {
                    if (entities) {
                        this.package.lookup_fetch_completed = entities.length !== this.package.fetched_items_max;
                        entities.forEach(item => {
                            this.package.lookup_rows.push(item);
                        });
                        this.package.lookup_last_index = this.package.lookup_rows.length;
                    }
                } finally {
                    if (cb)
                        cb();
                    this.package.lookup_loading = false;
                    this.isLookupExecuting = false;
                }
            },
            () => {

                this.package.lookup_loading = false;
            });
    }

    onSelectEntity(entity: T) {
        // if view do not open edit mode
        if (entity.entityInfo.isView === true) {
            return;
        }

        this.package.selected_entity = entity;
        this.package.entity_status_msg = '';
        this.package.error_msg = '';

        this.readPackageEntity(entity);
    }

    private readPackageEntity(entity: T, cb?: () => void) {
        this.readEntitiesByUkey(this.shellInfo,
            this.entityInfo,
            null,
            null, entity.uid, null, null, null, null, null,
            (entities_count, entities) => {
                this.package.entity = entities[0];
                this.package.validations = new KeyedCollection<ISelectObj>();
                this.package.show_filter = false;

                this.readEntityLookups(this.package.entity);

                if (entity.entityInfo.relations) {
                    for (const relation of entity.entityInfo.relations) {
                        let relation_entityInfo = ModelInfos.uniqueInstance.get(relation);
                        let relation_shellInfo = ShellInfos.uniqueInstance.get(relation);
                        this.readEntitiesByUkey(relation_shellInfo, relation_entityInfo, null, null,
                            entity[this.package.entity.ukeyPropName], null, relation, null, null, null,
                            (entities_count, entities) => {
                                this.package.entity[relation + '_relation'] = entities;
                                for (const entity of entities) {
                                    this.readEntityLookups(entity);
                                }
                            },
                            () => { this.package.show_filter = true; });
                    }
                }

                if (cb) {
                    cb();
                }
            }, () => { this.package.show_filter = true; });
    }

    private readEntityLookups(entity: BaseEntity) {
        for (const prop of entity.properties) {
            if (prop.lookup_entity_name) {
                let lookup_entityInfo = ModelInfos.uniqueInstance.get(prop.lookup_entity_name);
                let lookup_shellInfo = ShellInfos.uniqueInstance.get(prop.lookup_entity_name);
                this.readEntitiesByUkey(lookup_shellInfo, lookup_entityInfo, null,
                    null, null, [prop.lookup_properties[0], entity[prop.propName]], null, null, null, null,
                    (lk_entities_count, lk_entities) => {
                        if (lk_entities && lk_entities.length > 0) {
                            entity[prop.lookup_entity_name + '_lookup_entity'] = lk_entities[0];
                        }
                    },
                    null);
            }
        }
    }

    executeDetailFilterQuery(relation: string) {
        const promise = new Promise((result, reject) => {
            const relation_entityInfo: IEntityInfo = ModelInfos.uniqueInstance.get(relation);
            const relation_shellInfo: IShellInfo = ShellInfos.uniqueInstance.get(relation);
            const query = BaseEntity.toFilter(relation_shellInfo, relation_entityInfo, this.filterItems, null, null, null, null, null, this.entityInfo.ukeyPropName);
            if (query === null) {
                return result([]);
            }

            this.httpCaller.callPost('/sheetdata/select',
                {
                    spreadsheetName: relation_entityInfo.spreadsheetName,
                    sheetName: relation_entityInfo.sheetName,
                    entityName: relation_entityInfo.entityName,
                    select: query,
                    addSchema: false
                },
                r => {
                    const rows = r.rows as Array<any>;
                    const ukeys = [];
                    if (rows) {
                        const entities = [];
                        for (const row of rows) {
                            const ukey = row[this.entityInfo.ukeyPropName];
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

    executeCountQuery(keys?) {

        const promise = new Promise((result: (number) => void, reject) => {
            const entityInfo: IEntityInfo = this.entityInfo;
            let count_query = BaseEntity.toCountFilter(this.shellInfo, this.entityInfo, this.filterItems, keys);
            if (!count_query) {
                return null;
            }

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

    private filter_relation_keys = null;
    async loadEntitiesByFilter(
        count: boolean,
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        const entityInfo = this.entityInfo;
        const shellInfo = this.shellInfo;

        if (!this.filter_relation_keys) {
            this.filter_relation_keys = [];
            for (const relation of entityInfo.relations) {
                await this.executeDetailFilterQuery(relation)
                    .then(ukeys => {
                        this.filter_relation_keys = this.filter_relation_keys.concat(ukeys);
                        this.filter_relation_keys = Array.from(new Set(this.filter_relation_keys));
                    })
                    .catch(err => {
                        this.package.error_msg = this.getError(err);
                        cerr();

                    });
            }
        }

        if (count === true) {
            await this.executeCountQuery(this.filter_relation_keys)
                .then(count => {
                    cb(count, null);
                    if (count > 0) {
                        this.readEntitiesByUkey(shellInfo, entityInfo, this.filterItems, this.filter_relation_keys, null, null, null, this.package.filter_last_index, this.package.sortField, this.package.sortAscOrder, cb, cerr);
                    }
                    else {
                        this.package.filter_rows = [];
                    }
                })
                .catch(err => {
                    this.package.error_msg = this.getError(err);
                    cerr();
                });
        } else {
            this.readEntitiesByUkey(shellInfo, entityInfo, this.filterItems, this.filter_relation_keys, null, null, null, this.package.filter_last_index, this.package.sortField, this.package.sortAscOrder, cb, cerr);
        }
    }

    async loadLookupEntitiesByFilter(
        shellInfo: IShellInfo, entityInfo: IEntityInfo,
        filterItems: { filterCondition: { entityName: string, property: IPropInfo }; filterConditionValue: string; }[],
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        this.readEntitiesByUkey(shellInfo, entityInfo, filterItems, null, null, null, null, this.package.lookup_last_index, null, null, cb, cerr);

    }

    private readEntitiesByUkey(
        shellInfo: IShellInfo,
        entityInfo: IEntityInfo,
        filterItems: { filterCondition: { entityName: string, property: IPropInfo }; filterConditionValue: string; }[],
        keys,
        uid: any,
        ukey: [string, any],
        relation: string,
        fromIndex: number,
        sortField,
        sortAsc: boolean,
        cb: (rows_count: number, rows: Array<any>) => void,
        cerr: () => void) {

        let query;
        if (relation) {
            query = BaseEntity.toFKeyFilter(entityInfo, this.package.entity.ukeyPropName, uid, this.package.entity['relation_prop_' + relation + '_relation']);
        } else if (ukey) {
            query = BaseEntity.toUKeyFilter(entityInfo, ukey[0], ukey[1]);
        } else if (uid) {
            query = BaseEntity.toUIDFilter(entityInfo, uid);
        } else {

            let offset = fromIndex;
            const limit = this.package.fetched_items_max;
            query = BaseEntity.toFilter(shellInfo, entityInfo, filterItems, keys, offset, limit, sortField, sortAsc);
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
                const rows = result.rows as Array<any>;
                if (rows) {
                    const entities = [];
                    for (const row of rows) {
                        const entity = BaseEntity.createInstance(
                            ModelFactory.uniqueInstance.get(entityInfo.entityName),
                            row,
                            false,
                            null);
                        entity.status = eEntityStatus.Loaded;
                        entities.push(entity);
                    }
                    cb(undefined, entities);
                }
            },
            err => {

                this.showAlert(this.translateService.instant("MSG.CONNECTION_ERROR") + this.getError(err));
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
            this.showAlert(this.translateService.instant("MSG.ENTITY_DELETED"));
            return;
        }

        let action = eEntityAction.None;
        if (this.package.entity.status === eEntityStatus.New) {
            action = eEntityAction.Create;
        }
        else {
            action = eEntityAction.Update;
        }

        this.package.entity.onPrepareSave();
        this.validateEntity((validationResult) => {

            if (validationResult && validationResult.length > 0) {
                let message = '';
                for(let result of validationResult)
                {
                    if (message.length > 0)
                        message = message + ", "

                    let parts = result.split(',');
                    for(let part of parts)
                    {   
                        message = message + this.translateService.instant(part);
                    }
                }
                this.showAlert(this.translateService.instant("MSG.INVALID_FIELDS") + message);
                return;
            }

            this.setWaiting(true);

            this.saveEntity(action, this.package.entity, () => {
                if (this.package.entity.status === eEntityStatus.Loaded) {
                    Object.assign(this.package.selected_entity, this.package.entity);
                }
                this.package.entity_status_msg = 'Entity saved.';

                this.readPackageEntity(this.package.entity, () => { this.package.entity_status_msg = 'Entity saved & refetched.'; });
                this.setWaiting(false);
            });
        });
    }

    private setWaiting(action: boolean) {
        this.userSession.WaitingForAction = action;
    }

    private getEntitySaveCallPack(action: eEntityAction, entity: BaseEntity) {

        const entityInfo = entity.entityInfo;
        const select = BaseEntity.getFilterByUID(entity);
        if (action === eEntityAction.Delete) {
            return {
                sheetName: entityInfo.sheetName,
                sheetID: entityInfo.sheetID,
                ID: entity.uid,
                rowid: entity.rowid,
                selectEntity: select,
                action
            } as IEntityPackage;
        } else {
            return {
                sheetName: entityInfo.sheetName,
                sheetID: entityInfo.sheetID,
                ID: entity.uid,
                values: entity.toArray(),
                selectEntity: select,
                action
            } as IEntityPackage;
        }

    }

    private validateEntity(cb?: (validationResult) => void) {
        const packs = [];
        if (this.package.validations.Count() === 0) {
            if (cb) {
                cb(null);
            }
        }

        for (let validation_item of this.package.validations.Values()) {
            packs.push(
                ['/sheetdata/validate', validation_item]
            );
        }

        this.httpCaller.callPosts(
            packs,
            result => {
                if (cb) {
                    cb(result);
                }
            },
            err => {
                this.package.error_msg = this.getError(err);
                this.setWaiting(false);
            });
    }

    private saveEntity(action: eEntityAction, entity: BaseEntity, cb?: () => void) {
        const entityInfo = entity.entityInfo;
        const packs = [];
        if (entityInfo.relations) {
            for (const relation of entityInfo.relations) {
                if (this.package.entity[relation + '_relation']) {
                    for (const rentity of this.package.entity[relation + '_relation']) {
                        let raction = eEntityAction.None;

                        if (action === eEntityAction.Delete && (rentity.status === eEntityStatus.Loaded
                            || rentity.status === eEntityStatus.Updated)) {
                            raction = eEntityAction.Delete;
                        }
                        if (action === eEntityAction.Create) {
                            raction = eEntityAction.Create;
                        } else if (action === eEntityAction.Update) {
                            if (rentity.status === eEntityStatus.Updated) {
                                raction = eEntityAction.Update;
                            }
                            else if (rentity.status === eEntityStatus.New) {
                                raction = eEntityAction.Create;
                            }
                        }

                        if (raction !== eEntityAction.None) {
                            packs.push(this.getEntitySaveCallPack(raction, rentity));
                        }
                    }
                }
                if (action !== eEntityAction.Create && this.package.entity[relation + '_relation_deleted']) {
                    for (const rentity of this.package.entity[relation + '_relation_deleted']) {
                        packs.push(this.getEntitySaveCallPack(eEntityAction.Delete, rentity));
                    }
                }
            }
        }
        packs.push(this.getEntitySaveCallPack(action, entity));

        let url = '';
        if (action === eEntityAction.Update) {
            url = '/sheetdata/update';
        }
        else if (action === eEntityAction.Create) {
            url = '/sheetdata/create';
        }
        else if (action === eEntityAction.Delete) {
            url = '/sheetdata/delete';
        }

        this.httpCaller.callPost(
            url,
            {
                spreadsheetID: entityInfo.spreadsheetID,
                spreadsheetName: entityInfo.spreadsheetName,
                entityPackages: packs,
                action
            },
            result => {
                if (cb) {
                    cb();
                }
            },
            err => {
                this.package.error_msg = this.getError(err);
                this.setWaiting(false);
            });
    }

    onDelete() {
        if (this.package.entity.status === eEntityStatus.Deleted) {
            this.showAlert(this.translateService.instant("MSG.ENTITY_DELETED"));
            return;
        }

        if (this.package.entity.status === eEntityStatus.New) {
            this.showAlert(this.translateService.instant("MSG.NEWENTITY_DELETED"));
            this.package.show_filter = true;
            return;
        }

        this.saveEntity(eEntityAction.Delete, this.package.entity, () => {
            this.package.entity.status = eEntityStatus.Deleted;
            const index = this.package.filter_rows.indexOf(this.package.selected_entity);
            this.package.filter_rows.splice(index, 1);
            this.package.entity_status_msg = 'Entity deleted.';
        });

    }

    onUndo() {
        if (this.package.entity.status === eEntityStatus.Deleted
            || this.package.entity.status === eEntityStatus.New) {
            this.showAlert(this.translateService.instant("MSG.CANNOT_UNDO"));
            return;
        }

        this.readPackageEntity(
            this.package.entity,
            () => {
                this.package.entity_status_msg = 'Entity restored.';
            });


    }

    clearMsg(showFilter?: boolean) {

        this.package.entity_status_msg = '';
        this.package.error_msg = '';
        if (showFilter) {
            this.package.show_filter = showFilter;
        }
    }

    private getError(err): string {
        if (err === null || err === undefined) {
            return 'generic error';
        }
        else if (err instanceof String) {
            return err.toString();
        }
        else if (err instanceof HttpErrorResponse) {
            return err.message;
        }
        else if (err.error) {
            return this.getError(err['error']);
        }
        else {
            return JSON.stringify(err);
        }
    }

    private showAlert(message: string) {

        const modalRef = this.modalService.open(AlertDialogWnd);
        modalRef.componentInstance.message = message;
    }

    private showReport(reportUrl: string) {

        const modalRef = this.modalService.open(ReportDialogWnd,
            { windowClass: 'report-modal', size: 'lg' }
        );
        modalRef.componentInstance.reportUrl = reportUrl;
    }

    private askYesNo(message: string) {

        const modalRef = this.modalService.open(AskDialogWnd);
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    private openEditDialog(title: string, validation?: () => boolean, relation?) {

        const modalRef = this.modalService.open(EditEntityDialogWnd,
            { size: 'lg' }
        );
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
        } else {
            return false;
        }
    }

    isVisible(property: IPropInfo, entityParent: T, forFilter?: boolean) {
        if (property === undefined
            || (property.propName === 'uid' || property.propName === 'rowid')
            || (entityParent && entityParent.ukeyPropName === property.propName)
            || (forFilter && property.isFilterHidden)
            || (property.isHidden === true)) {
            return false;
        } else {
            return true;
        }
    }

    // private entity_properties: IPropInfo[] = [];
    // public get entityProperties() {

    //     if (this.package.entity === undefined || this.package.entity.properties === undefined)
    //         return this.entity_properties;

    //     if (this.entity_properties.length == 0) {
    //         this.entity_properties.concat(this.package.entity.properties)

    //         for (let prop of this.package.entity.shellInfo.properties) {
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

    public getRelationFilterProperties() {
        let properties = [];
        for (const relation of this.entityInfo.relations) {
            const pp = this.getRelationProperties(this.entityInfo, relation, false, true);
            properties = properties.concat(pp);
        }
        return properties;
    }
    public getRelationProperties(entityInfo: IEntityInfo, relation: string, addLookups: boolean, addEntityName?: boolean) {
        const relation_entityInfo = ModelInfos.uniqueInstance.get(relation.toLowerCase());
        const properties = [];
        if (!relation) {
            return properties;
        }

        if (!relation_entityInfo.properties) {
            return properties;
        }

        for (const property of relation_entityInfo.properties) {
            if (property.propName === 'uid' || property.propName === 'rowid'
                || property.propName === entityInfo.ukeyPropName || property.isHidden === true) {
                continue;
            }

            //property.relation = relation;
            if (addEntityName === true)
                properties.push({ property, entityName: relation_entityInfo.entityName });
            else
                properties.push(property);

            if (property.lookup_entity_name && addLookups === true) {
                let newprop = {
                    propName: property.lookup_properties[1],
                    propCaption: property.lookup_properties[1],
                    path: property.lookup_entity_name + '_lookup_entity',
                    dataType: 's',
                    //relation
                } as IPropInfo;

                if (addEntityName === true)
                    properties.push({ property: newprop, entityName: relation_entityInfo.entityName });
                else
                    properties.push(newprop);

            }
        }
        return properties;
    }

    public onCreateEntityByRelation(relation: string, validation?: () => boolean, cb?: () => void) {

        this.package.entity_relation = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(relation), null,
            false, this.package.entity);
        this.package.entity_relation.status = eEntityStatus.New;
        this.openEditDialog('New: ' + relation, validation, relation).then(result => {
            if (result === 'Save') {
                if (!this.package.entity[relation + '_relation']) {
                    this.package.entity[relation + '_relation'] = [];
                }
                this.package.entity[relation + '_relation'].push(this.package.entity_relation);
            } else {
                this.package.entity_relation = undefined;
            }

            cb();

        }, (reason) => {
            this.package.entity_relation = undefined;
        });

    }

    public onEditEntityByRelation(entity: BaseEntity, relation: string, validation?: () => boolean, cb?: () => void) {
        const index = this.package.entity[relation + '_relation'].indexOf(entity);
        this.package.entity_relation = BaseEntity.createInstance(ModelFactory.uniqueInstance.get(relation),
            entity, true, null);
        this.package.entity_relation.status = eEntityStatus.None;
        this.openEditDialog('Edit: ' + relation, validation, relation).then(result => {
            if (result === 'Save') {
                if (this.package.entity_relation.status !== eEntityStatus.New) {
                    this.package.entity_relation.status = eEntityStatus.Updated;
                }
                this.package.entity[relation + '_relation'][index] = this.package.entity_relation;
            } else if (result === 'Delete') {
                this.onDeleteEntityByRelation(entity, relation, true);
            } else {
                this.package.entity_relation = undefined;
            }

            if (cb) {
                cb();
            }

        }, (reason) => {
            this.package.entity_relation = undefined;
        });


    }

    public onDeleteEntityByRelation(entity: BaseEntity, relation: string, silent?: boolean) {
        const deleteaction = () => {
            const index = this.package.entity[relation + '_relation'].indexOf(entity);
            this.package.entity[relation + '_relation'].splice(index, 1);
            if (entity.status !== eEntityStatus.New) {
                entity.status = eEntityStatus.Deleted;
                if (this.package.entity[relation + '_relation_deleted'] === undefined) {
                    this.package.entity[relation + '_relation_deleted'] = [];
                }
                this.package.entity[relation + '_relation_deleted'].push(entity);
            }
        };

        if (silent === true) {
            deleteaction();
        } else {
            this.askYesNo(this.translateService.instant("MSG.DELETE_ITEM")).then(result => {
                if (result === 'Yes') {
                    deleteaction();
                }
            }, (reason) => {

            });
        }
    }

    openLookupWnd(lookupSource: BaseEntity, lookupSourceProperty: IPropInfo) {
        const modalRef = this.modalService.open(SelectEntityDialogWnd,
            { windowClass: 'select-entity-modal', size: 'lg' });
        modalRef.componentInstance.title = 'select: ' + lookupSourceProperty.lookup_entity_name;
        modalRef.componentInstance.lookupSource = lookupSource;
        modalRef.componentInstance.lookupSourceProperty = lookupSourceProperty.propName;
        modalRef.componentInstance.lookupEntityName = lookupSourceProperty.lookup_entity_name;
        modalRef.componentInstance.lookupTargetProperty = lookupSourceProperty.lookup_properties[0];

        modalRef.componentInstance.lookupProperties = lookupSourceProperty.lookup_properties;;
        modalRef.componentInstance.package = this.package;
        modalRef.componentInstance.packageCtrl = this;
        return modalRef.result.then((result) => {

        }, (reason) => {

        });
    }


    onSelectLookup(lookupSource: BaseEntity, lookupSourceProperty: string, lookupEntity: BaseEntity, lookupTargetProperty: string) {

        lookupSource[lookupEntity.entityName.toLowerCase() + '_lookup_entity'] = lookupEntity;
        lookupSource[lookupSourceProperty] = lookupEntity[lookupTargetProperty];
        this.removeValidation(lookupSource, lookupSourceProperty);
    }

    public getInputType(property: IPropInfo) {

        if (property.customInputType) {
            return property.customInputType;
        } else {
            const dataType: string = property.dataType;
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

            entity[property.propName] = Number.parseFloat(entity[property.propName] || '0.0');

        } else if (property.dataType === eFieldDataType.Integer && typeof entity[property.propName] === 'string') {

            entity[property.propName] = Number.parseInt(entity[property.propName] || '0');

        }

        let cascaded_value = false;
        if (entity) {
            cascaded_value = entity.onPropValueChanged(property, entity[property.propName]);
        }

        if (entity.ukeyPropName === property.propName || cascaded_value) {
            if (entity.entityInfo.relations) {
                for (const relation of entity.entityInfo.relations) {
                    if (entity[relation + '_relation']) {
                        for (const item of entity[relation + '_relation']) {
                            item[entity.ukeyPropName] = entity[entity.ukeyPropName];
                            if (item.status !== eEntityStatus.New) {
                                item.status = eEntityStatus.Updated
                            }
                        }
                    }
                }
            }
            this.addValidation(entity, entity.entityName, property.propName);
        } else if (property.lookup_entity_name) {
            if (!entity[property.propName] || entity[property.propName].toString().trim().length === 0) {
                this.removeValidation(entity, property.propName);
            } else {
                this.addValidation(entity, property.lookup_entity_name, property.propName);
            }
        }


    }
    onEditorFocusChanged(entity: BaseEntity, property: IPropInfo) {
        if (property.lookup_entity_name) {
            if (!entity[property.propName] || entity[property.propName].toString().trim().length === 0) {

                entity[property.lookup_entity_name + '_lookup_entity'] = '';
            } else {
                const selectItem = this.getLookupSelect(entity, property.lookup_entity_name, property.propName);

                this.httpCaller.callPost(
                    '/sheetdata/select',
                    selectItem,
                    result => {
                        const entities = result.rows as Array<any>;
                        if (entities && entities.length > 0) {
                            entity[property.lookup_entity_name + '_lookup_entity'] = entities[0];
                        }
                        else {
                            entity[property.lookup_entity_name + '_lookup_entity'] = '';
                        }
                    },
                    err => {
                        // show error if code wrong
                    });
            }
        }
    }


    addValidation(entity: BaseEntity, lookup_entity_name: string, propName: string) {
        let validation_item: ISelectObj;

        const checkUnique = (entity.entityName === lookup_entity_name);


        let lookup_entity = checkUnique ? entity : ModelFactory.uniqueInstance.create(lookup_entity_name);
        this.removeValidation(entity, propName);
        validation_item = {} as ISelectObj;
        validation_item.spreadsheetName = lookup_entity.spreadsheetName;
        validation_item.sheetName = lookup_entity.sheetName;
        validation_item.select = BaseEntity.getFilterByUKey(lookup_entity, propName, entity[propName], false, checkUnique);
        validation_item.addSchema = false;
        validation_item.checkUnique = checkUnique;
        validation_item.entityName = entity.entityInfo.entityName;
        this.package.validations.Add(entity.uid + propName, validation_item);
        return validation_item;
    }

    getLookupSelect(entity: BaseEntity, lookup_entity_name: string, propName: string) {
        let select_item: ISelectObj;
        let lookup_entity = ModelFactory.uniqueInstance.create(lookup_entity_name);
        select_item = {} as ISelectObj;
        select_item.spreadsheetName = lookup_entity.spreadsheetName;
        select_item.sheetName = lookup_entity.sheetName;
        select_item.select = BaseEntity.getFilterByUKey(lookup_entity, propName, entity[propName], true);
        select_item.addSchema = false;
        return select_item;
    }

    removeValidation(entity: BaseEntity, propName: string) {
        if (this.package.validations.ContainsKey(entity.uid + propName)) {
            this.package.validations.Remove(entity.uid + propName)
        }
    }

    public onPrint() {

        this.setWaiting(true);

        const pack = this.getEntitySaveCallPack(eEntityAction.Update, this.package.entity);
        pack.reportType = this.package.entity.getReportType();

        pack.values = this.package.entity;
        const preloadObs = new Observable((observer) => {

            let shellInfo = ShellInfos.uniqueInstance.get(this.package.entity.entityName);
            const packs = shellInfo.report.preloads;
            let index = 0;

            if (packs.length === 0) {
                return observer.complete();
            }
            for (const ppack of packs) {
                let p: Promise<IEntityInfo> = null;
                const einfo = ModelInfos.uniqueInstance.get(ppack.entity_name);
                if (einfo.fetched === false) {
                    p = this.readEntityInfo(einfo);

                } else {
                    p = Promise.resolve(einfo);
                }
                p.then(ei => {
                    const spack: ISelectObj = {
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
                                // call callback
                                entity = r.rows[0];
                            }
                            console.log(entity);
                            ppack.cb(this.package.entity, entity);
                            if (index >= packs.length) {
                                observer.complete();
                            }

                        },
                        err => {
                            observer.error();
                            console.log(err);
                        });
                }).catch((err) => {
                    observer.error();
                    console.log(err);

                });

            }

        });

        preloadObs.subscribe(() => { },
            () => {
                console.log('report error');
                this.package.error_msg = 'report error...';
                this.setWaiting(false);
            },
            () => {
                console.log('report launch');
                this.httpCaller.callPdf(
                    '/sheetdata/report',
                    this.userSession,
                    pack,
                    reportUrl => {
                        this.showReport(reportUrl);
                        this.setWaiting(false);
                    },
                    err => {
                        this.package.error_msg = this.getError(err);
                        this.setWaiting(false);
                    });
            });

    }


    public onShowCalendar() {
        window.open('https://calendar.google.com/calendar');
    }

    public calculateMaxFilterItem(rowheight) {
        let rootheight = window.innerHeight;
        if (rootheight > 0 && rowheight > 0)
            this.package.fetched_items_max = Math.ceil((rootheight / rowheight) * 1.8);
    }

    public onPickMaxValue(entity, property) {
        let filter = BaseEntity.getMaxFilter(entity, property);
        const entityInfo: IEntityInfo = this.entityInfo;
        let that = this;
        this.httpCaller.callPost(
            '/sheetdata/getscalar',
            {
                spreadsheetName: entityInfo.spreadsheetName,
                sheetName: entityInfo.sheetName,
                entityName: entityInfo.entityName,
                select: filter
            },
            r => {
                let max: number = r.scalar;
                that.package.entity[property.propName] = max;
                that.onEditorValueChanged(entity, property)
            },
            err => {
                ;
            });
    }
}
