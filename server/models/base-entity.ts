import { IEntityInfo } from './base-entity';
import { ModelInfos } from "./modelProperties";
import "reflect-metadata"
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

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
    spreadsheetID: string,
    sheetID: string,
    spreadsheetName: string,
    sheetName: string,
    entityName: string,
    relations: string[],

    properties: Array<IPropInfo>
}

export interface IPropInfo {
    propName: string,
    cellName: string;
    onlyEdit: boolean;
    dataType: string;
    mask: string;
    lookup_entity_name?: string;
    lookup_properties?: string[];
}


export enum eEntityStatus {
    None = 0,
    New = 1,
    Loaded = 2,
    Deleted = 3,
    Updated = 4
}



export function SheetInfo(spreadsheetName: string, sheetName: string, entityName: string, ukeyPropName?: string) {
    return (ctor: Function) => {
        ctor.prototype['spreadsheet_name'] = spreadsheetName;
        ctor.prototype['sheet_name'] = sheetName;
        ctor.prototype['entity_name'] = entityName;
        ctor.prototype['ukey_prop_name'] = ukeyPropName;
    }
}

export function LookupProp(entityName: string, propNames: (string)[]) {

    return (prototype: any, propName: string) => {

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

    public status: eEntityStatus = eEntityStatus.None;

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
        return this.lookups;
    }

    get properties(): Array<IPropInfo> {
        return this.entityInfo.properties;
    }

    public toArray(): (String | Number | Date)[] {
        let array = [];

        if (this.properties) {
            for (let p of this.properties) {
                if ((this.status === eEntityStatus.New && (p.propName === 'uid' || p.propName === 'rowid')) === false)
                    array.push(this[p.propName])
            }
        }

        return array;
    }

    public clearFilter() {

        for (let p of this.properties) {
            if (this[p.propName]) {
                this[p.propName] = undefined;
            }
        }
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
        var mm = date.month + 1;
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
            month: date.getMonth(),
            year: date.getFullYear()
        };

    }

    public static parseDateStruct(value: string): NgbDateStruct {
        if (value) {
            const dateParts = value.trim().split('/');
            if (dateParts.length === 1 && isNumber(dateParts[0])) {
                return { year: toInteger(dateParts[0]), month: null, day: null };
            } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
                return { year: toInteger(dateParts[1]), month: toInteger(dateParts[0]) - 1, day: null };
            } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
                return { year: toInteger(dateParts[2]), month: toInteger(dateParts[1]) - 1, day: toInteger(dateParts[0]) };
            }
        }
        return null;
    }

    public static parseNumber(value: string): Number {
        if (value) {
            value = value.trim().replace(',', '');
            if (value.indexOf(".")>=0)
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
            stringDate += isNumber(date.month) ? padNumber(date.month + 1) + "/" : "";
            stringDate += date.year;
        }
        return stringDate;
    }

    public static toUKeyFilter(entityInfo: IEntityInfo, uid: any): string {

        let query = 'select ';
        for (let p of entityInfo.properties) {
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


    public static toFKeyFilter(relationEntityInfo: IEntityInfo, fkeyPropName: string, fkeyvalue: any): string {

        let query = 'select ';
        for (let p of relationEntityInfo.properties) {
            query = query + p.cellName + ',';
        }
        let p_uid = relationEntityInfo.properties.find(p => p.propName === fkeyPropName)
        if (p_uid && fkeyvalue) {
            query = query.slice(0, query.length - 1);
            if (fkeyvalue instanceof Number)
                query = query + ' where ' + p_uid.cellName + ' = ' + fkeyvalue;
            else
                query = query + ' where ' + p_uid.cellName + ' = "' + fkeyvalue + '"';
            return query;
        }
        else {
            return '';
        }

    }

    public static toFilter(entity: BaseEntity, keys, offset: number, limit: number, forFkey?: string): string {

        let entityInfo = entity.entityInfo;

        let query = 'select ';
        let fkeycell = '';
        for (let p of entity.properties) {
            if (!forFkey || (forFkey && p.propName === forFkey))
                query = query + p.cellName + ',';

            if (forFkey && p.propName === forFkey) {
                query = query + 'count(' + p.cellName + '),';
                fkeycell = p.cellName;
            }
        }
        query = query.slice(0, query.length - 1);
        query = query + ' where ';

        let where = ' 1=1 ';
        let where_keys = '';
        let exists_filter = false;
        let not_string = false;
        for (let p of entity.properties) {
            if (entity[p.propName] && entity[p.propName] !== '') {
                exists_filter = true;
                let fvalue = (<string>entity[p.propName]).toUpperCase();
                let li = Math.max(fvalue.lastIndexOf('<'), fvalue.lastIndexOf('>'), fvalue.lastIndexOf('='));
                //date, time
                if (p.dataType === 'DATE' || p.dataType === 'TIME') {
                    if (li >= 0) {
                        let datevalue = BaseEntity.dateStructToStandardDate(BaseEntity.parseDateStruct(fvalue.substring(li + 1)));
                        where = where + ' and ' + p.cellName + fvalue.substring(0, li + 1) + ' date "' + datevalue + '"';
                    }
                    else {
                        let datevalue = BaseEntity.dateStructToStandardDate(BaseEntity.parseDateStruct(fvalue));
                        where = where + ' and ' + p.cellName + ' = date "' + datevalue + '"';
                    }
                }
                //number
                else if (p.dataType === 'NUMBER') {
                    if (li >= 0) {
                        where = where + ' and ' + p.cellName + fvalue.substring(0, li + 1) +  BaseEntity.parseNumber(fvalue.substring(li + 1)).toString(); 
                    }
                    else {
                        where = where + ' and ' + p.cellName + ' = ' +  BaseEntity.parseNumber(fvalue).toString();
                    }
                }
                //string
                else if (fvalue.indexOf('%') >= 0)
                    where = where + ' and upper(' + p.cellName + ') like "' + fvalue + '"';
                else if (li >= 0)
                    where = where + ' and upper(' + p.cellName + ')' + fvalue.substring(0, li + 1) + '"' + fvalue.substring(li + 1) + '"';
                else
                    where = where + ' and upper(' + p.cellName + ') like "%' + fvalue + '%"';
            }
            if (p.propName === entity.ukeyPropName) {
                if (keys && keys.length > 0) {

                    where_keys = where_keys + ' and ( 1=0 ';
                    for (let key of keys) {
                        if (key instanceof Number)
                            where_keys = where_keys + ' or ' + p.cellName + ' = ' + key;
                        else
                            where_keys = where_keys + ' or ' + p.cellName + ' = "' + key + '"';
                    }
                    where_keys = where_keys + ')';
                }
            }

        }
        if (!exists_filter && forFkey)
            return null;

        query = query + where + where_keys;

        if (forFkey) {
            query = query + ' group by ' + fkeycell;
        }
        else {
            if (limit)
                query = query + ' limit ' + limit;
            if (offset)
                query = query + ' offset ' + offset;
        }
        return query;
    }

    public toCountFilter(keys?): string {

        let query = 'select count(A) where 1=1 ';

        for (let p of this.properties) {
            if (this[p.propName]) {
                let fvalue = (<string>this[p.propName]).toUpperCase();
                let li = Math.max(fvalue.lastIndexOf('<'), fvalue.lastIndexOf('>'), fvalue.lastIndexOf('='));
                //date or time
                if (p.dataType === 'DATE' || p.dataType === 'TIME') {
                    if (li >= 0) {
                        let datevalue = BaseEntity.dateStructToStandardDate(BaseEntity.parseDateStruct(fvalue.substring(li + 1)));
                        query = query + ' and ' + p.cellName + fvalue.substring(0, li + 1) + ' date "' + datevalue + '"';
                    }
                    else {
                        let datevalue = BaseEntity.dateStructToStandardDate(BaseEntity.parseDateStruct(fvalue));
                        query = query + ' and ' + p.cellName + ' = date "' + datevalue + '"';
                    }
                }
                //number
                else if (p.dataType === 'NUMBER') {
                    if (li >= 0) {
                        query = query + ' and ' + p.cellName + fvalue.substring(0, li + 1) +   BaseEntity.parseNumber(fvalue.substring(li + 1)).toString();
                    }
                    else {
                        query = query + ' and ' + p.cellName + ' = ' +  BaseEntity.parseNumber(fvalue).toString();
                    }
                }
                //string
                else if (fvalue.indexOf('%') >= 0)
                    query = query + ' and upper(' + p.cellName + ') like "' + fvalue + '"';
                else if (li >= 0)
                    query = query + ' and upper(' + p.cellName + ')' + fvalue.substring(0, li + 1) + '"' + fvalue.substring(li + 1) + '"';
                else
                    query = query + ' and upper(' + p.cellName + ') like "%' + fvalue + '%"';
            }

            if (p.propName === this.ukeyPropName) {
                if (keys && keys.length > 0) {
                    query = query + ' and ( 1=0 ';
                    for (let key of keys) {
                        if (key instanceof Number)
                            query = query + ' or ' + p.cellName + ' = ' + key;
                        else
                            query = query + ' or ' + p.cellName + ' = "' + key + '"';
                    }
                    query = query + ')';
                }
            }
        }

        return query;
    }

    static createInstance<T extends BaseEntity>(type: new () => T, instance?: Object, forceClone?: boolean, parent?: BaseEntity): T {
        let new_instance: T;
        if ((instance instanceof type) === true && forceClone !== true) {
            new_instance = <T>instance;
        }
        else {
            new_instance = new type();
            if (instance !== undefined)
                Object.assign(new_instance, instance);
        }

        if (parent && parent.ukeyPropName) //copy the unique key
            new_instance[parent.ukeyPropName] = parent[parent.ukeyPropName];

        return new_instance;
    }
}


