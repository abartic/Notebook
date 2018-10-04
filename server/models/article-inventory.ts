import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("movements", "art_inventory", "ArticleInventory")  
export class ArticleInventory extends BaseEntity {

    @LookupProp("article", ["code_art","descr_art", "UM"])
    public code_art : string;

    @LookupProp("store", ["code_store","descr_store"])
    public code_store : string;
    
    public qty_in : number;

    public qty_out : number;

}