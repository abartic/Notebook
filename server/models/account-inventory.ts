import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("movements", "account_inventory", "AccountInventory")  
export class AccountInventory extends BaseEntity {

    @LookupProp("partner", ["code_part","descr_part"])
    public code_part : string;
    
    public debit_value : number;
    
    public credit_value : number;

}