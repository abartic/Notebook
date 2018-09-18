
import { BaseEntity, SheetInfo } from "./base-entity";

@SheetInfo("partners", "addresses","Address")  
export class Address extends BaseEntity {


    public code_part : String;

    public line_address : String;
    
    public city : String;
    
    public county : String;

    public country : String;

    public zip : String;

    public email : String;
}