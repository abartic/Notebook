import { Address } from './address';
import { Contact } from './contact';
import { BaseEntity } from "./base-entity";

export class Partner extends BaseEntity {

    public code_part : String;

    public name : String;
    
    public descr : String;
    
    public type : String;
    
    public unit : String;
    
    public addresses : (Address)[];

    public contacts : (Contact)[];

    public toArray() {
        return super.toArray().concat([this.code_part, this.name, this.descr, this.type, this.unit]);
    }
}