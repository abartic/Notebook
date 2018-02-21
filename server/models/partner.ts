import { Address } from './address';
import { Contact } from './contact';
import { BaseEntity } from "./base-entity";

export class Partner extends BaseEntity<Partner> {

    public code_part: String;

    public name: String;

    public descr: String;

    public type: String;

    public unit: String;

    public addresses: (Address)[];

    public contacts: (Contact)[];

    protected getPropertiesMaps(): Array<[string, string]> { return Partner.propertiesMaps; }

    static propertiesMaps: Array<[string, string]> = [
        ["code_part", "C"],
        ["name", "D"],
        ["descr", "E"],
        ["type", "F"],
        ["unit", "G"]
    ];
}