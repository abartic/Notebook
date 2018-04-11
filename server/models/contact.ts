
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("partners", "contacts", "Contact")  
export class Contact extends BaseEntity {

    public code_part : String;

    public name : String;
    
    public email : String;
    
    public phone1 : String;
    
    public phone2 : String;

}