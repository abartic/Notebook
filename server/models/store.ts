
import { BaseEntity } from "./base-entity";

export class Store extends BaseEntity<Store> {

    public code_store : String;

    public descr : String;

    protected getPropertiesMaps(): Array<[string, string]> { return Store.propertiesMaps; }

    static propertiesMaps: Array<[string, string]> = [
        ["code_store", "C"],
        ["descr", "D"]
    ];
}