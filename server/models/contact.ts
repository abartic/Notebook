
import { BaseEntity } from "./base-entity";

export class Contact extends BaseEntity {

    public code_part : String;

    public name : String;
    
    public email : String;
    
    public phone1 : String;
    
    public phone2 : String;
    
    public toArray() {
        return super.toArray().concat([this.code_part, this.name, this.email, this.phone1, this.phone2]);
    }
}