
import { BaseEntity, LookupProp, SheetInfo } from "./base-entity";

@SheetInfo("movements", "document_lines","DocumentLine")
export class DocumentLine extends BaseEntity {

    public code_doc : String;

    @LookupProp("article", ["code_art", "descr", "UM"])
    public code_art : String;
    
    public price_in : Number;
    
    public price_out : Number;
    
    public qty : Number;
    
    public discount : Number;

}