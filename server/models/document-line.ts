
import { BaseEntity, LookupProp, SheetInfo } from "./base-entity";

@SheetInfo("documents", "document_lines")
export class DocumentLine extends BaseEntity {

    public code_doc : String;

    @LookupProp("artcle", ["cod_art"])
    public code_art : String;
    
    public price_in : Number;
    
    public price_out : Number;
    
    public qty : Number;
    
    public discount : Number;

}