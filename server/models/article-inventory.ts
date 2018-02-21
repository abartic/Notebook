
import { BaseEntity } from "./base-entity";

export class ArticleInventory extends BaseEntity<ArticleInventory> {

    public code_art : String;

    public code_store : String;
    
    public prince_in : Number;
    
    public qty : Number;
    
    protected getPropertiesMaps(): Array<[string, string]> { return ArticleInventory.propertiesMaps; }
    static propertiesMaps: Array<[string, string]> = [
        ["code_art", "C"],
        ["code_store", "D"],
        ["prince_in", "E"],
        ["qty", "F"],
        
    ];
}