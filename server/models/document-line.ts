
import { BaseEntity } from "./base-entity";

export class DocumentLine extends BaseEntity<DocumentLine> {

    public code_doc : String;

    public code_art : String;
    
    public price_in : Number;
    
    public price_out : Number;
    
    public qty : Number;
    
    public discount : Number;
    
    protected getPropertiesMaps(): Array<[string, string]> { return DocumentLine.propertiesMaps; }
    static propertiesMaps: Array<[string, string]> = [
        ["code_doc", "C"],
        ["code_art", "D"],
        ["price_in", "E"],
        ["price_out", "F"],
        ["qty", "G"],
        ["discount", "H"],
        
    ];

}