import { Address } from './address';
import { Contact } from './contact';
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";
import { PartnerShell } from '../shells/partner-shell';

@SheetInfo("partners", "partners", "Partner", PartnerShell.adjustShellInfo, "code_part") export
    class Partner extends BaseEntity {

       

    public code_part: String;

    public name_partner: String;

    public descr_partner: String;

    public type_partner: String;

    public unit: String;

    public currency: string;

    public www_address : string;

    public email : string;

    public reg_number : string;

    public fiscal_reg_number: string;

    public name_admin : string;

    public name_rep : string;

    public IBAN : string;

    public IBAN_bank : string;

    public invoice_report_type : string;
    public receivable_report_type : string;

    public address_relation: (Address)[];

    public contact_relation: (Contact)[];

    public onNew(parent: BaseEntity) 
    {
        super.onNew(parent);
     
        this.address_relation = [];
        this.contact_relation = [];
    }

}