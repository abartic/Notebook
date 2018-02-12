
import { BaseEntity } from "./base-entity";

export class ArticleInventory extends BaseEntity {

    public code_art : String;

    public code_store : String;
    
    public prince_in : Number;
    
    public qty : Number;
    
    public toArray() {
        return super.toArray().concat([this.code_art, this.code_store, this.prince_in, this.qty]);
    }
}