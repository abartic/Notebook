
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("settings", "companies", "Company", "code_comp")
export class Company extends BaseEntity {

    public code_comp: String;

    public name_comp: String;

    public descr_comp: String;

    public type_comp: String;

    public country: String;

    public county: String;

    public city: String;

    public zip_code: String;

    public address: String;

    public reg_number: String;

    public fiscal_reg_number: String;

    public name_admin: String;

    public name_rep: String;

    public email: String;

    public www_address: String;

    public phone1: String;

    public phone2: String;

    public IBAN : string;

    public IBAN_bank : string;

    public custom_invoice_report : string;
}