
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("partners", "contacts", "Contact", "code_part")  
export class Contact extends BaseEntity {

    public code_part : string;

    public name : string;
    
    public email : string;
    
    public phone1 : string;
    
    public phone2 : string;

}