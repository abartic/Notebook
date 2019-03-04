import { BaseEntity, SheetInfo } from "./base-entity";

@SheetInfo("inventory", "articles", "Article", null, "code_art")  
export class Article extends BaseEntity {


    public code_art : string;

    public descr_art : string;
    
    public UM : string;
    
    public EAN : string;
    
    public SN : string;
    
    public attr1 : string;
    
    public attr2 : string;
    
    public attr3 : string;
    
    public attr4 : string;
    
    public attr5: string;
   
    public entry_date : Date;

    //public articleinventory_relation : (ArticleInventory)[];
}