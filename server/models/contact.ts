
import { BaseEntity } from "./base-entity";

export class Contact extends BaseEntity<Contact> {

    public code_part : String;

    public name : String;
    
    public email : String;
    
    public phone1 : String;
    
    public phone2 : String;
    
    public toArray() {
        return super.toArray().concat([this.code_part, this.name, this.email, this.phone1, this.phone2]);
    }

    protected getPropertiesMaps(): Array<[string, string]> { return Contact.propertiesMaps; }
    static propertiesMaps: Array<[string, string]> = [
        ["code_part", "C"],
        ["name", "D"],
        ["email", "E"],
        ["phone1", "F"],
        ["phone2", "G"],
        
    ];

}