import { IEntityInfo, IPropInfo, IShellInfo } from './base-entity';
import { ModelInfos, ShellInfos } from "./modelProperties";
import "reflect-metadata"
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as uuidv1 from 'uuid/v1';
import { eFieldDataType } from '../common/enums';


function padNumber(value: number) {
    if (isNumber(value)) {
        return `0${value}`.slice(-2);
    } else {
        return "";
    }
}

function isNumber(value: any): boolean {
    return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
    return parseInt(`${value}`, 10);
}


export interface IEntityInfo {
    spreadsheetID?: string;
    sheetID?: string;
    spreadsheetName?: string;
    sheetName?: string;
    entityName?: string;
    relations?: string[];
    isView?: boolean;
    ukeyPropName?: string;
    properties?: Array<IPropInfo>;
    entityLookups?: Map<string, { entityName: string, propNames: (string)[] }>;
    fetched: boolean;
}

export interface IPropInfo {
    propName: string;
    propCaption?: string;
    dataType: string;

    path?: string;
    cellName?: string;

    mask?: string;
    lookup_entity_name?: string;
    lookup_properties?: string[];
    isHidden?: boolean;
    isFilterHidden?: boolean;
    isReadOnly?: boolean;
    isCustom?: boolean;
    dropdownlist?;
    dropdownsettings?;
    customInputType?: string;
    //relation?: string;
}

export interface IShellInfo {
    filter?: {
        fields?: {
            add: IPropInfo[],
            remove: string[]
        },
        static_filter?: { key: string, value: string }[],
        //commands?: { caption: string, handler: string, primary?: boolean, isDisabled?: boolean, isActive? : (pack)=>boolean }[];
        selectFirst?: boolean,
        hasDetails?: boolean,
        sortFields?: string[],
    };
    properties?: { name: string, datatype: string, isReadOnly: boolean }[];
    commands?: { caption: string, handler: string, primary?: boolean, isDisabled?: boolean, image?: string, isActive?: (pack) => boolean }[];
    report?: {
        preloads: { entity_name: string, ukey_prop_name: string, cb: (entity, lentity) => void }[]
    };
    pivotInfo?: any;
}

export enum eEntityStatus {
    None = 0,
    New = 1,
    Loaded = 2,
    Deleted = 3,
    Updated = 4
}

export enum eEntityAction {
    None = 0,
    Create = 1,
    Delete = 2,
    Update = 3,
}


export function SheetInfo(spreadsheetName: string, sheetName: string, entityName: string, adjustShellInfo?: (IShellInfo) => void, ukeyPropName?: string) {
    return (ctor: Function) => {
        ctor.prototype['spreadsheet_name'] = spreadsheetName;
        ctor.prototype['sheet_name'] = sheetName;
        ctor.prototype['entity_name'] = entityName;
        ctor.prototype['ukey_prop_name'] = ukeyPropName;
        ModelInfos.uniqueInstance.addOrUpdate(entityName, { spreadsheetName, sheetName, entityName, ukeyPropName, fetched: false, entityLookups: ctor.prototype['lookups'] });
        let shellinfo = {
            filter: {
                fields: {
                    add: [],
                    remove: []
                },
                static_filter: []
            },
            properties: [],
            commands: [
                { caption: 'BTN.NEW', handler: 'onNew', image: 'fa fa-pencil' },
                { caption: 'BTN.SAVE', handler: 'onSave', image: 'fa fa-floppy-o' },
                { caption: 'BTN.DELETE', handler: 'onDelete', image: 'fa fa-trash-o' },
                { caption: 'BTN.UNDO', handler: 'onUndo', image: 'fa fa-undo' }
            ],
            report: {
                preloads: []
            }
        };
        if (adjustShellInfo)
            adjustShellInfo(shellinfo);
        ShellInfos.uniqueInstance.add(entityName, shellinfo);
    }
}


export function LookupProp(entityName: string, propNames: (string)[]) {
    return (prototype: any, propName: string) => {

        // let info: IEntityInfo = ModelInfos.uniqueInstance.get(prototype.constructor.name);
        // if (!info) {
        //     info = {entityLookups: null, fetched: false};
        //     ModelInfos.uniqueInstance.addOrUpdate(prototype.constructor.name, info);
        // }
        if (!prototype['lookups'])
            prototype['lookups'] = new Map<string, { entityName: string, propNames: (string)[] }>();
        prototype['lookups'].set(propName, { entityName, propNames });
    }
}

export class BaseEntity {

    public rowid: number;

    public uid: string;

    private ukey_prop_name: string;

    private entity_name: string;

    private sheet_name: string;

    private spreadsheet_name: string;

    private lookups: Map<string, { entityName: string, propNames: (string)[] }>;

    public fetchAll: boolean;

    public status: eEntityStatus = eEntityStatus.None;

    public static getEntityInformation() {

    }

    get spreadsheetName(): string {
        return this.spreadsheet_name;
    }
    get sheetName(): string {
        return this.sheet_name;
    }

    get entityName(): string {

        return this.entity_name;
    }

    get ukeyPropName(): string {
        return this.ukey_prop_name;
    }


    public get entityInfo(): IEntityInfo {
        return ModelInfos.uniqueInstance.get(this.entityName);
    }

    get entityLookups(): Map<string, { entityName: string, propNames: (string)[] }> {
        return this.entityInfo.entityLookups;
    }

    get properties(): Array<IPropInfo> {
        let props = this.entityInfo.properties;

        return props;
    }

    public toArray(): (String | Number | Date)[] {
        let array = [];

        if (this.properties) {
            for (let p of this.properties) {
                if (p.isCustom === true)
                    continue;
                if ((this.status === eEntityStatus.New && (p.propName === 'rowid')) === false)
                    array.push(this[p.propName])
            }
        }

        return array;
    }

    public static dateToStandardDate(date: Date): string {
        var mm = date.getMonth();
        var dd = date.getDate();

        return [
            date.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
        ].join('-');
    }

    public static dateStructToStandardDate(date: NgbDateStruct): string {
        var mm = date.month;
        var dd = date.day;

        return [
            date.year,
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
        ].join('-');
    }

    public static toDateStructFormat(date: Date): NgbDateStruct {

        return {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear()
        };

    }

    public static parseDateStruct(value: string): NgbDateStruct {
        if (value) {
            const dateParts = value.trim().split('/');
            if (dateParts.length === 1 && isNumber(dateParts[0])) {
                return { year: toInteger(dateParts[0]), month: null, day: null };
            } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
                return { year: toInteger(dateParts[1]), month: toInteger(dateParts[0]), day: null };
            } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
                return { year: toInteger(dateParts[2]), month: toInteger(dateParts[1]), day: toInteger(dateParts[0]) };
            }
        }
        return null;
    }

    public static parseNumber(value: string): Number {
        if (value) {
            value = value.trim().replace(',', '');
            if (value.indexOf(".") >= 0)
                return Number.parseFloat(value);
            else
                return Number.parseInt(value);
        }
        return null;
    }

    public static toUserFormatDate(date: NgbDateStruct): string {
        let stringDate: string = "";
        if (date) {
            stringDate += isNumber(date.day) ? padNumber(date.day) + "/" : "";
            stringDate += isNumber(date.month) ? padNumber(date.month) + "/" : "";
            stringDate += date.year;
        }
        return stringDate;
    }

    private static SHEETS_EPOCH_DIFFERENCE = -2209161600000;
    private static DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    public static toGoogleSheetsAPIDate(date: NgbDateStruct) {
        let utcdate = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
        let millisSinceUnixEpoch = utcdate.getTime() + -1 * utcdate.getTimezoneOffset() * 60 * 1000;
        let millisSinceSheetsEpoch = millisSinceUnixEpoch - BaseEntity.SHEETS_EPOCH_DIFFERENCE;
        return millisSinceSheetsEpoch / BaseEntity.DAY_IN_MILISECONDS;
    }

    public static toUIDFilter(entityInfo: IEntityInfo, uid: any): string {

        let query = 'select ';
        for (let p of entityInfo.properties) {
            if (p.isCustom === true)
                continue;
            query = query + p.cellName + ',';
        }
        let p_uid = entityInfo.properties.find(p => p.propName === 'uid')
        query = query.slice(0, query.length - 1);
        if (uid instanceof Number)
            query = query + ' where ' + p_uid.cellName + ' = ' + uid;
        else
            query = query + ' where ' + p_uid.cellName + ' = "' + uid + '"';
        return query;
    }


    public static toUKeyFilter(entityInfo: IEntityInfo, ukey_prop_name: string, ukey_value: any): string {

        let query = 'select ';
        for (let p of entityInfo.properties) {
            if (p.isCustom === true)
                continue;
            query = query + p.cellName + ',';
        }
        let p_ukey = entityInfo.properties.find(p => p.propName === ukey_prop_name)
        query = query.slice(0, query.length - 1);
        if (ukey_value instanceof Number)
            query = query + ' where ' + p_ukey.cellName + ' = ' + ukey_value;
        else
            query = query + ' where ' + p_ukey.cellName + ' = "' + ukey_value + '"';
        return query;
    }


    public static toFKeyFilter(relationEntityInfo: IEntityInfo, fkeyPropName: string, fkeyvalue: any, relationInfo?: { groupby: string[], pivot: string[] }): string {

        let query = 'select ';
        // if (relationInfo) {
        //     for (let p of relationEntityInfo.properties) {
        //         if (relationInfo.groupby.findIndex(e => e === p.propName) >= 0)
        //             query = query + p.cellName + ',';
        //         else
        //             if (relationInfo.pivot.findIndex(e => e === p.propName) < 0)
        //             // if (p.dataType === eFieldDataType.Numeric || p.dataType === eFieldDataType.Integer)
        //             //     query = query + 'sum(' + p.cellName + '),';
        //             // else
        //             query = query + 'max(' + p.cellName + '),';
        //     }
        // }
        // else {
        for (let p of relationEntityInfo.properties) {
            if (p.isCustom === true)
                continue;
            query = query + p.cellName + ',';
        }
        //}
        let p_uid = relationEntityInfo.properties.find(p => p.propName === fkeyPropName)
        if (p_uid && fkeyvalue) {
            query = query.slice(0, query.length - 1);
            if (fkeyvalue instanceof Number)
                query = query + ' where ' + p_uid.cellName + ' = ' + fkeyvalue;
            else
                query = query + ' where ' + p_uid.cellName + ' = "' + fkeyvalue + '"';

            // if (relationInfo) {
            //     let groupby = '';
            //     for (let gb of relationInfo.groupby) {
            //         for (let p of relationEntityInfo.properties) {
            //             if (p.propName === gb)
            //                 groupby = groupby + p.cellName + ',';
            //         }
            //     }
            //     groupby = groupby.slice(0, groupby.length - 1);
            //     let pivot = '';
            //     for (let pv of relationInfo.pivot) {
            //         for (let p of relationEntityInfo.properties) {
            //             if (p.propName === pv)
            //                 pivot = pivot + p.cellName + ',';
            //         }
            //     }
            //     pivot = pivot.slice(0, pivot.length - 1);

            //     query = query + ' group by ' + groupby + ' pivot ' + pivot;
            // }
            return query;
            //return 'select max(A), max(B), D,E,F, max(K), max(L) where C = "11" group by D,E,F pivot H';
        }
        else {
            return '';
        }

    }

    public static getFilterByUID(entity: BaseEntity): string {
        let entityInfo = entity.entityInfo;
        let cell_id, cell_uid;
        for (let p of entityInfo.properties) {
            if (p.isCustom === true)
                continue;
            if (p.propName === 'uid')
                cell_uid = p.cellName;
            else if (p.propName === 'rowid')
                cell_id = p.cellName;
            else
                continue;
        }

        let query = "select " + cell_id + " where " + cell_uid + " = '" + entity.uid + "'";
        return query;
    }

    public static getMaxFilter(entity: BaseEntity, property: IPropInfo): string {
        let entityInfo = entity.entityInfo;
        let cell;
        for (let p of entityInfo.properties) {
            if (p.propName === property.propName)
                cell = p.cellName;
            else
                continue;
        }

        let query = "select max(" + cell + ")";
        return query;
    }

    public static getFilterByUKey(entity: BaseEntity, ukey_prop_name: string, ukey_prop_value, allFields: boolean, excludeCurrentUid?: boolean): string {
        let entityInfo = entity.entityInfo;
        let cell_ukey, additionalWhere = '';
        let query = 'select '
        for (let p of entityInfo.properties) {
            if (p.isCustom === true)
                continue;

            if (p.propName === ukey_prop_name)
                cell_ukey = p.cellName;
            if (excludeCurrentUid === true && p.propName === 'uid')
                additionalWhere = " and " + p.cellName + " <> '" + entity.uid + "'";
            if (allFields === false && p.propName !== ukey_prop_name)
                continue;

            query = query + p.cellName + ',';
        }

        query = query.slice(0, query.length - 1);
        query = query + ' where  upper(' + cell_ukey + ') = "' + (ukey_prop_value.toString() || '').trim().toUpperCase() + '" ' + additionalWhere + ' limit 1';
        return query;
    }

    public static toFilter(
        shellInfo: IShellInfo,
        entityInfo: IEntityInfo,
        filterItems: { filterCondition: { entityName: string, property: IPropInfo }; filterConditionValue: string; }[],
        keys, offset: number, limit: number,
        sortField, sortAsc : boolean,
        forFkey?: string): string {

        let query = 'select ';
        let fkeycell = '';
        for (let p of entityInfo.properties) {
            if (p.isCustom === true)
                continue;

            if (!forFkey || (forFkey && p.propName === forFkey))
                query = query + p.cellName + ',';

            if (forFkey && p.propName === forFkey) {
                query = query + 'count(' + p.cellName + '),';
                fkeycell = p.cellName;
            }
        }
        query = query.slice(0, query.length - 1);
        query = query + ' where ';

        let where = this.addFilterWhereClause(shellInfo, entityInfo, filterItems, keys);
        if (where.length === 0 && forFkey)
            return null;

        query = query + ' 1=1 ' + where;

        if (shellInfo.filter && shellInfo.filter.static_filter) {
            let static_where = BaseEntity.getStaticFilter(shellInfo.filter.static_filter, entityInfo.properties);
            if (static_where)
                query = query + ' and ' + static_where;
        }

        if (forFkey) {
            query = query + ' group by ' + fkeycell;
        }
        else {
            if (sortField)
            {
                let sp = entityInfo.properties.find(p=>p.propName === sortField.property.propName);
                query = query + ' order by ' + sp.cellName + ((sortAsc === false) ? ' desc ' : '');
            }

            if (limit)
                query = query + ' limit ' + limit;
            if (offset)
                query = query + ' offset ' + offset;
        }
        return query;
    }

    public static toCountFilter(shellInfo: IShellInfo,
        entityInfo: IEntityInfo,
        filterItems: { filterCondition: { entityName: string, property: IPropInfo }; filterConditionValue: string; }[],
        keys?): string {

        let query = 'select count(A) where ';

        let where = ' 1=1 ';
        where = where + this.addFilterWhereClause(shellInfo, entityInfo, filterItems, keys);

        query = query + where;
        return query;
    }

    static addFilterWhereClause(shellInfo: IShellInfo,
        entityInfo: IEntityInfo,
        filterItems: { filterCondition: { entityName: string, property: IPropInfo }; filterConditionValue: string; }[],
        keys?) {
        let where = '', where_keys = '';

        if (!filterItems)
            return where;

        for (let item of filterItems) {
            if (item.filterCondition.property.isCustom === true || item.filterCondition.entityName.toUpperCase() !== entityInfo.entityName.toUpperCase())
                continue;
            if (item.filterConditionValue === null || item.filterConditionValue === '')
                continue;


            let fvalue = item.filterConditionValue.toUpperCase();
            let li = Math.max(fvalue.lastIndexOf('<'), fvalue.lastIndexOf('>'), fvalue.lastIndexOf('='));
            //date, time
            if (item.filterCondition.property.dataType === eFieldDataType.Date || item.filterCondition.property.dataType === eFieldDataType.Time) {
                if (li >= 0) {
                    let datevalue = BaseEntity.dateStructToStandardDate(BaseEntity.parseDateStruct(fvalue.substring(li + 1)));
                    where = where + ' and ' + item.filterCondition.property.cellName + fvalue.substring(0, li + 1) + ' date "' + datevalue + '"';
                }
                else {
                    let datevalue = BaseEntity.dateStructToStandardDate(BaseEntity.parseDateStruct(fvalue));
                    where = where + ' and ' + item.filterCondition.property.cellName + ' = date "' + datevalue + '"';
                }
            }
            //number
            else if (item.filterCondition.property.dataType === eFieldDataType.Numeric) {
                if (li >= 0) {
                    where = where + ' and ' + item.filterCondition.property.cellName + fvalue.substring(0, li + 1) + BaseEntity.parseNumber(fvalue.substring(li + 1)).toString();
                }
                else {
                    where = where + ' and ' + item.filterCondition.property.cellName + ' = ' + BaseEntity.parseNumber(fvalue).toString();
                }
            } //number
            else if (item.filterCondition.property.dataType === eFieldDataType.Boolean) {
                where = where + ' and ' + item.filterCondition.property.cellName + ' = ' + fvalue.toString();
            }
            //string
            else if (fvalue.indexOf('%') >= 0) {
                if (fvalue.startsWith('<>'))
                    where = where + ' and not upper(' + item.filterCondition.property.cellName + ') like "' + fvalue.replace('<>', '') + '"';
                else
                    where = where + ' and upper(' + item.filterCondition.property.cellName + ') like "' + fvalue + '"';
            }
            else if (li >= 0)
                where = where + ' and upper(' + item.filterCondition.property.cellName + ')' + fvalue.substring(0, li + 1) + '"' + fvalue.substring(li + 1) + '"';
            else {
                if (fvalue.startsWith('<>'))
                    where = where + ' and not upper(' + item.filterCondition.property.cellName + ') like "%' + fvalue + '%"';
                else
                    where = where + ' and upper(' + item.filterCondition.property.cellName + ') like "%' + fvalue + '%"';
            }
        }

        for (let property of entityInfo.properties) {
            if (property.propName === entityInfo.ukeyPropName) {
                if (keys && keys.length > 0) {

                    where_keys = where_keys + ' and ( 1=0 ';
                    for (let key of keys) {
                        if (key instanceof Number)
                            where_keys = where_keys + ' or ' + property.cellName + ' = ' + key;
                        else
                            where_keys = where_keys + ' or ' + property.cellName + ' = "' + key + '"';
                    }
                    where_keys = where_keys + ')';
                }
            }
        }

        return where + where_keys;
    }

    static createInstance<T extends BaseEntity>(type: new () => T,
        instance?: Object,
        forceClone?: boolean,
        parent?: BaseEntity): T {
        let new_instance: T;
        if ((instance instanceof type) === true && forceClone !== true) {
            new_instance = <T>instance;
        }
        else {
            new_instance = new type();
            if (instance !== undefined) {
                Object.assign(new_instance, instance);
                //keep reference to initial instance got from table
                new_instance['_row_'] = instance;
            }
        }

        if (parent && parent.ukeyPropName) //copy the unique key
        {
            new_instance[parent.ukeyPropName] = parent[parent.ukeyPropName];
        }

        if (instance === null) {
            new_instance.onNew(parent);
        }

        return new_instance;
    }

    public static getStaticFilter(filter: { key: string, value: any }[], properties: IPropInfo[]): any {
        let where = '';
        for (let item of filter) {
            if (where.length > 0)
                where = where + ' and ';
            for (let p of properties) {
                if (p.propName === item.key) {
                    if (p.dataType === 'NUMBER') {
                        where = where + p.cellName + ' = ' + BaseEntity.parseNumber(item.value).toString();
                    }
                    else if (p.dataType === 'BOOLEAN') {
                        where = where + ' and ' + p.cellName + ' = ' + item.value.toString();
                    }
                    else {
                        where = where + ' upper(' + p.cellName + ') = "' + item.value + '"';
                    }
                }
            }
        }

        return where;
    }

    public onPrepareSave() { }

    public onNew(parent: BaseEntity) {
        if (!this.uid || this.uid === '')
            this.uid = uuidv1();
    }



    public onPropValueChanged(propName: IPropInfo, propValue: any): boolean {
        return false;
    }

    public compareForValidation(other: BaseEntity): boolean {
        return this === other;
    }

    private propNameChanged: string;
    public get propChanged(): string {
        return this.propNameChanged;
    }
    protected setPropChanged(value: string) {
        this.propNameChanged = value;
    }
    public clearPropChanged() {
        this.propNameChanged = undefined;
    }

    public adjustDataForPivoting(fields?: string[]) {
        if (fields) {
            for (let p of Object.keys(this)) {
                if (fields.includes(p) === false)
                    delete this['_row_'][p];
            }
        }
        return this['_row_'];
    }

    public prepareForJsonSerialization() {
        delete this['status'];
        delete this['fetchAll'];
        delete this['propNameChanged'];
    }

    public onChildrenUpdate() { }

    public getReportType(): any {
        return this.entityName.toLocaleLowerCase();
    }


}