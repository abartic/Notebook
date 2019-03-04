import { ExpenseLine } from './expense-line';

import { BaseEntity, IEntityInfo, IShellInfo } from './base-entity';


export class ModelInfos {
    private static _uniqueInstance: ModelInfos;
    private maps: Array<[string, IEntityInfo]> = [];



    public addOrUpdate(type: string, entityInfo: IEntityInfo) {
        let info = this.get(type);
        if (info === null){
            this.maps.push([type.toLowerCase(), entityInfo]);
        }
        else{
            info = Object.assign(info, entityInfo);
        }
    }
    public get(type: string): IEntityInfo {
        let map = this.maps.find(p => p["0"] === type.toLowerCase())
        if (map)
            return map["1"];
        else {
            return null; 
        }

    }
    public set(type: string, value: IEntityInfo) {
        return this.maps.push([type, value]);
    }
    public static get uniqueInstance(): ModelInfos {
        if (ModelInfos._uniqueInstance === undefined) {
            ModelInfos._uniqueInstance = new ModelInfos();
        }
        return ModelInfos._uniqueInstance;
    }

   
}

export class ShellInfos {
    private static _uniqueInstance: ShellInfos;
    private maps: Array<[string, IShellInfo]> = [];

    public add(type: string, entityInfo: IShellInfo) {
        let info = this.get(type);
        if (info === null){
            this.maps.push([type.toLowerCase(), entityInfo]);
        }
        else{
            info = Object.assign(info, entityInfo);
        }
    }
    public get(type: string): IShellInfo {
        let map = this.maps.find(p => p["0"] === type.toLowerCase())
        if (map)
            return map["1"];
        else {
            return null; 
        }

    }
    public set(type: string, value: IShellInfo) {
        return this.maps.push([type, value]);
    }
    public static get uniqueInstance(): ShellInfos {
        if (ShellInfos._uniqueInstance === undefined) {
            ShellInfos._uniqueInstance = new ShellInfos();
        }
        return ShellInfos._uniqueInstance;
    }

   
}