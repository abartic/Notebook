
import { BaseEntity, LookupProp, SheetInfo } from "./base-entity";
import { Invoice } from "./invoice";

@SheetInfo("movements", "document_lines","InvoiceLine")
export class InvoiceLine extends BaseEntity {

    public code_doc : String;

    @LookupProp("article", ["code_art", "descr_art", "UM", "entry_date"])
    public code_art : String;
    
    public price_in : Number;
    
    public price_out : Number;
    
    public qty : Number;
    
    public discount : Number;
    
    public move_date : Date;

    public onNew(parent : BaseEntity)
    {
        if (parent)
            this.move_date = (<Invoice>parent).creation_date;
    }
}