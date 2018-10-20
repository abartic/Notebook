import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo } from "./base-entity";

@SheetInfo("movements", "accounts_inventory", "AccountInventory")
export class AccountInventory extends BaseEntity {


    @LookupProp("partner", ["code_part", "descr_part"])
    public code_part: string;

    public debit_value: number;

    public credit_value: number;

    public balance: number;

    public getShellInfo(): IShellInfo {
        return {
            filter: {
                fields: {
                    add: [],
                    remove: []
                },
                static_filter: []
            },
            properties: [
                
            ],
            commands: {
                add: [],
                remove: []
            },
            report: {
                preloads: []
            }

        };
    }
    
}