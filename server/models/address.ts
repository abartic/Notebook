
import { BaseEntity, SheetInfo } from "./base-entity";

@SheetInfo("partners", "addresses")  
export class Address extends BaseEntity {


    public code_part : String;

    public line1 : String;
    
    public line2 : String;
    
    public city : String;
    
    public county : String;

    public country : String;

    public zip : String;
}