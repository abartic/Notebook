
import { BaseEntity, IEntityInfo } from './base-entity';

export class ModelInfos {
    private static _uniqueInstance: ModelInfos;
    private maps: Array<[string, IEntityInfo]> = [];

    public add(type: string, pmaps: IEntityInfo) {
        if (this.maps.findIndex(m=>m["0"] === type.toLowerCase()) < 0)
            this.maps.push([type.toLowerCase(), pmaps]);
    }
    public get(type: string): IEntityInfo {
        let map = this.maps.find(p => p["0"] === type.toLowerCase())
        if (map)
            return map["1"];
        else
            return <IEntityInfo>{};
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