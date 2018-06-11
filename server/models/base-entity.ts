import { IEntityInfo } from './base-entity';
import { ModelInfos } from "./modelProperties";
import "reflect-metadata"

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
        for (let p of entity.properties) {
            if (entity[p.propName] && entity[p.propName] !== '') {
                exists_filter = true;
                let fvalue = (<string>entity[p.propName]).toUpperCase();
                if (fvalue.indexOf('%') >= 0)
                    where = where + ' and upper(' + p.cellName + ') like "' + fvalue + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0 && '=<>'.indexOf(fvalue[1]) >= 0)
                    where = where + ' and upper(' + p.cellName + ')' + fvalue.substring(0, 2) + '"' + fvalue.substring(2) + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0)
                    where = where + ' and upper(' + p.cellName + ')' + fvalue.substring(0, 1) + '"' + fvalue.substring(1) + '"';
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

                if (fvalue.indexOf('%') >= 0)
                    query = query + ' and upper(' + p.cellName + ') like "' + fvalue + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0 && '=<>'.indexOf(fvalue[1]) >= 0)
                    query = query + ' and upper(' + p.cellName + ')' + fvalue.substring(0, 2) + '"' + fvalue.substring(2) + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0)
                    query = query + ' and upper(' + p.cellName + ')' + fvalue.substring(0, 1) + '"' + fvalue.substring(1) + '"';
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


