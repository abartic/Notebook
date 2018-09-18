import { ArticleInventory } from './article-inventory';

import { BaseEntity, SheetInfo } from "./base-entity";

@SheetInfo("inventory", "articles", "Article", "code_art")  
export class Article extends BaseEntity {

    public code_art : String;

    public descr_art : String;
    
    public UM : String;
    
    public EAN : String;
    
    public SN : String;
    
    public attr1 : String;
    
    public attr2 : String;
    
    public attr3 : String;
    
    public attr4 : String;
    
    public attr5: String;
   
    public entry_date : Date;
    //public articleinventory_relation : (ArticleInventory)[];
}