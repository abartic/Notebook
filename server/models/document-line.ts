
import { BaseEntity } from "./base-entity";

export class DocumentLine extends BaseEntity {

    public code_doc : String;

    public code_art : String;
    
    public price_in : Number;
    
    public price_out : Number;
    
    public qty : Number;
    
    public discount : Number;
    
    public toArray() {
        return super.toArray().concat([this.code_doc, this.code_art, this.price_in, this.price_out, this.qty, this.discount]);
    }
}