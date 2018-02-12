import { DocumentLine } from './document-line';

import { BaseEntity } from "./base-entity";

export class Document extends BaseEntity {

    public code_doc : String;

    public code_part : String;
    
    public type : String;
    
    public creation_date : Date;
    
    public due_date : Date;
    
    public register_date : Date;
    
    public internal_reference : String;
    
    public store_in : String;
    
    public store_out: String;

    public documentLines : (DocumentLine)[];

    public toArray() {
        return super.toArray().concat([this.code_doc, this.code_part, this.type, this.creation_date, this.due_date, this.register_date, this.internal_reference, this.store_in, this.store_out]);
    }
}