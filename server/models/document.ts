import { DocumentLine } from './document-line';

import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("documents", "documents", "code_doc")
export class Document extends BaseEntity{

    public code_doc : String;

    @LookupProp("partner", ["code_part","descr"])
    public code_part : String;
    
    public type : String;
    
    public creation_date : Date;
    
    public due_date : Date;
    
    public register_date : Date;
    
    public internal_reference : String;
    
    public store_in : String;
    
    public store_out: String;

    public document_line_relation : (DocumentLine)[];
}