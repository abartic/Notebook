
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("inventory", "art_inventory", "ArticleInventory")  
export class ArticleInventory extends BaseEntity {

    @LookupProp("article", ["cod_art","descr", "UM"])
    public code_art : String;

    @LookupProp("store", ["cod_store","descr"])
    public code_store : String;
    
    public prince_in : Number;
    
    public qty : Number;
}