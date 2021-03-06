import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo } from "./base-entity";
import { ArticleInventoryShell } from '../shells/articleinventory-shell';

@SheetInfo("movements", "art_inventory", "ArticleInventory", ArticleInventoryShell.adjustShellInfo)  
export class ArticleInventory extends BaseEntity {

    @LookupProp("article", ["code_art","descr_art", "UM"])
    public code_art : string;

    @LookupProp("store", ["code_store","descr_store"])
    public code_store : string;
    
    public qty_in : number;

    public qty_out : number;

    public qty_net: number;


}