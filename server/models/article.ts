
import { BaseEntity } from "./base-entity";

export class Article extends BaseEntity {

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

    public toArray() {
        return super.toArray().concat([this.code_art, this.descr, this.UM, this.EAN, this.SN, this.attr1, this.attr2, this.attr3, this.attr4, this.attr5]);
    }
}