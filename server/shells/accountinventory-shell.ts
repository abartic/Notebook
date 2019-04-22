import { IShellInfo } from './../models/base-entity';
export class AccountInventoryShell
{

    public static adjustShellInfo(shellInfo : IShellInfo) {
        shellInfo.commands = [];
        
        shellInfo.filter.sortFields = ["code_part","debit_value","credit_value", "balance"];
    }
}