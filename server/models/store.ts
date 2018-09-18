
import { BaseEntity, SheetInfo } from "./base-entity";

@SheetInfo("inventory", "stores", "Store", "code_store")  
export class Store extends BaseEntity {

    public code_store : String;

    public descr_store : String;
}