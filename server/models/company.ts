
import { BaseEntity, SheetInfo, LookupProp, IShellInfo } from "./base-entity";

@SheetInfo("settings", "companies", "Company", "code_comp")
export class Company extends BaseEntity {

    public code_comp: string;

    public name_comp: string;

    public descr_comp: string;

    public type_comp: string;

    public country: string;

    public county: string;

    public city: string;

    public zip_code: string;

    public address: string;

    public reg_number: string;

    public fiscal_reg_number: string;

    public name_admin: string;

    public name_rep: string;

    public email: string;

    public www_address: string;

    public phone1: string;

    public phone2: string;

    public IBAN : string;

    public IBAN_bank : string;

    public invoice_report : string;
    public invoice_ext_report : string;

    public receivable_report : string;
    public receivable_ext_report : string;

    public expenses_report : string;

    public adjustShellInfo() {
        this.shellInfo.filter.autoApply = true;
        this.shellInfo.filter.commands = [{ caption: 'Refresh', handler: 'onApply', primary : true },];
        this.shellInfo.commands = [
            { caption: 'Save', handler: 'onSave', primary : true },
            { caption: 'Undo', handler: 'onUndo' }
        ];
    }
    
}