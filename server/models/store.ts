
import { BaseEntity, SheetInfo } from "./base-entity";

@SheetInfo("inventory", "stores", "Store")  
export class Store extends BaseEntity {

    public code_store : String;

    public descr : String;
}