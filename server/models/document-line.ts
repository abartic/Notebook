
import { BaseEntity } from "./base-entity";

export class DocumentLine extends BaseEntity {

    public code_doc : String;

    public code_art : String;
    
    public price_in : Number;
    
    public price_out : Number;
    
    public qty : Number;
    
    public discount : Number;

}