import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("movements", "art_inventory", "ArticleInventory")  
export class ArticleInventory extends BaseEntity {

    @LookupProp("article", ["code_art","descr_art", "UM"])
    public code_art : String;

    @LookupProp("store", ["code_store","descr_store"])
    public code_store : String;
    
    public price_in : Number;
    
    public qty : Number;

}