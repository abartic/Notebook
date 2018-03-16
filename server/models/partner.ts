import { Address } from './address';
import { Contact } from './contact';
import { BaseEntity, IPropInfo, SheetInfo } from "./base-entity";

@SheetInfo("partners", "partners") export 
class Partner extends BaseEntity {

    public code_part: String;

    public name: String;

    public descr: String;

    public type: String;

    public unit: String;

    public addresses: (Address)[];

    public contacts: (Contact)[];
   
}