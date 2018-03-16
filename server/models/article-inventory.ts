
import { BaseEntity } from "./base-entity";

export class ArticleInventory extends BaseEntity {

    public code_art : String;

    public code_store : String;
    
    public prince_in : Number;
    
    public qty : Number;
}