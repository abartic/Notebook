import { Address } from './address';
import { Contact } from './contact';
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";

@SheetInfo("partners", "partners", "code_part") export
    class Partner extends BaseEntity {

    public code_part: String;

    @LookupProp("address", ["line1","country"])
    public name: String;

    public descr: String;

    public type: String;

    public unit: String;

    public address_relation: (Address)[];

    public contact_relation: (Contact)[];

}