
import { BaseEntity } from "./base-entity";

export class Article extends BaseEntity<Article> {

    public code_art : String;

    public descr : String;
    
    public UM : String;
    
    public EAN : String;
    
    public SN : String;
    
    public attr1 : String;
    
    public attr2 : String;
    
    public attr3 : String;
    
    public attr4 : String;
    
    public attr5: String;

    protected getPropertiesMaps(): Array<[string, string]> { return Article.propertiesMaps; }
    static propertiesMaps: Array<[string, string]> = [
        ["code_art", "C"],
        ["descr", "D"],
        ["UM", "E"],
        ["EAN", "F"],
        ["SN", "G"],
        ["attr1", "H"],
        ["attr2", "I"],
        ["attr3", "J"],
        ["attr4", "K"],
        ["attr5", "L"],
    ];
}