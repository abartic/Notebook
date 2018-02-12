
import { BaseEntity } from "./base-entity";

export class Address extends BaseEntity {

    public code_part : String;

    public line1 : String;
    
    public line2 : String;
    
    public city : String;
    
    public county : String;

    public country : String;

    public zip : String;
    
    public toArray() {
            return super.toArray().concat([this.code_part, this.line1, this.line2, this.city, this.county, this.country, this.zip]);
    }
}