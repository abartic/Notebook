import { DocumentLine } from './document-line';

import { BaseEntity } from "./base-entity";

export class Document extends BaseEntity<Document> {

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

    protected getPropertiesMaps(): Array<[string, string]> { return Document.propertiesMaps; }
    static propertiesMaps: Array<[string, string]> = [
        ["code_doc", "C"],
        ["code_part", "D"],
        ["type", "E"],
        ["creation_date", "F"],
        ["due_date", "G"],
        ["register_date", "H"],
        
        ["internal_reference", "I"],
        ["store_in", "J"],
        ["store_out", "K"],
    ];

}