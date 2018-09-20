import { InvoiceLine } from './invoice-line';
import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';


import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";
import { Partner } from './partner';

@SheetInfo("movements", "documents", "Invoice", "code_doc")
export class Invoice extends BaseEntity {

    public code_doc: String;

    @LookupProp("partner", ["code_part", "name_partner", "descr_partner"])
    public code_part: String;

    public type_doc: String;

    public creation_date: Date;

    public due_date: Date;

    public register_date: Date;

    public internal_reference: String;

    @LookupProp("store", ["code_store", "descr_store"])
    public store_in: String;

    @LookupProp("store", ["code_store", "descr_store"])
    public store_out: String;

    public invoiceline_relation: (InvoiceLine)[];


    public preparePackForReportPreloads() {
        let packs = [

            {
                entity_name: 'partner', ukey_prop_name: 'code_part', cb: p => {
                    this['partner_lookup_entity'] = p;
                }
            },

            {
                entity_name: 'address', ukey_prop_name: 'code_part', cb: pa => {
                    this['partner_address_lookup_entity'] = pa;
                }
            }
        ];
        return packs;
    }
}