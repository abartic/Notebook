
import { BaseEntity } from "./base-entity";

export class Address extends BaseEntity<Address> {

    public code_part : String;

    public line1 : String;
    
    public line2 : String;
    
    public city : String;
    
    public county : String;

    public country : String;

    public zip : String;
    
    protected getPropertiesMaps(): Array<[string, string]> { return Address.propertiesMaps; }
    static propertiesMaps: Array<[string, string]> = [
        ["code_part", "C"],
        ["line1", "D"],
        ["line2", "E"],
        ["city", "F"],
        ["county", "G"],
        ["country", "H"],
        ["zip", "I"],
    ];
}