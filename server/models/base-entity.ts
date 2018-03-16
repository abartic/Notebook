import { ModelInfos } from "./modelProperties";

export interface IEntityInfo {
    spreadsheetID: string,
    sheetID: string,

    prototype: object,
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
}


export enum eEntityStatus {
    None = 0,
    New = 1,
    Loaded = 2,
    Deleted = 3,
}

export function SheetInfo(spreadsheetName : string, sheetName: string) {
    return (ctor: Function) => {
        ctor.prototype['spreadsheet_name'] = spreadsheetName;
        ctor.prototype['sheet_name'] = sheetName;
    }
}


export class BaseEntity {

    constructor() {

    }

    public rowid: number;

    public uid: string;
    
    private sheet_name : string;

    private spreadsheet_name : string;

    public status: eEntityStatus = eEntityStatus.None;

    get spreadsheetName(): string {
        return this.spreadsheet_name;
    }
    get sheetName(): string {
        return this.sheet_name;
    }

    get entityName(): string {
        return this.constructor.name;
    }

    get entityInfo(): IEntityInfo {
        return ModelInfos.uniqueInstance.get(this.entityName);
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

    public toUKeyFilter(): string {
        let query = 'select ';
        for (let p of this.properties) {
            query = query + p.cellName + ',';
        }
        let p_uid = this.properties.find(p => p.propName === 'uid')
        query = query.slice(0, query.length - 1);
        query = query + ' where ' + p_uid.cellName + ' = "' + this.uid + '"';
        return query;
    }

    public toFilter(offset: number, limit: number): string {

        let query = 'select ';
        for (let p of this.properties) {
            query = query + p.cellName + ',';
        }
        query = query.slice(0, query.length - 1);
        query = query + ' where ';

        let where = ' 1=1 ';
        for (let p of this.properties) {
            if (this[p.propName]) {
                let fvalue = (<string>this[p.propName]).toUpperCase();
                if (fvalue.indexOf('%') >= 0)
                    where = where + ' and upper(' + p.cellName + ') like "' + fvalue + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0 && '=<>'.indexOf(fvalue[1]) >= 0)
                    where = where + ' and upper(' + p.cellName + ')' + fvalue.substring(0, 2) + '"' + fvalue.substring(2) + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0)
                    where = where + ' and upper(' + p.cellName + ')' + fvalue.substring(0, 1) + '"' + fvalue.substring(1) + '"';
                else
                    where = where + ' and upper(' + p.cellName + ') like "%' + fvalue + '%"';
            }
        }
        query = query + where;

        if (limit)
            query = query + ' limit ' + limit;
        if (offset)
            query = query + ' offset ' + offset;
        return query;
    }

    public toCountFilter(offset: number, limit: number): string {

        let query = 'select count(A) where 1=1 ';

        for (let p of this.properties) {
            if (this[p["0"]]) {
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
        }

        if (limit)
            query = query + ' limit ' + limit;
        if (offset)
            query = query + ' offset ' + offset;
        return query;
    }

    static createInstance<T extends BaseEntity>(type: new () => T, instance?: Object): T {
        let new_instance: T;
        if ((instance instanceof type) === true) {
            new_instance = <T>instance;
        }
        else {
            new_instance = new type();
            if (instance !== undefined)
                Object.assign(new_instance, instance);
        }
        return new_instance;
    }
}


