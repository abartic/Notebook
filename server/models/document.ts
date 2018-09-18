import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';
import { DocumentLine } from './document-line';

import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";
import { Partner } from './partner';

@SheetInfo("movements", "documents", "Document", "code_doc")
export class Document extends BaseEntity {

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

    public documentline_relation: (DocumentLine)[];


    public preparePackForReportPreloads() {
        let packs = [

            {
                entity_name: 'partner', ukey_prop_name: 'code_part', cb: p => {
                    this['partner'] = p;
                }
            },

            {
                entity_name: 'address', ukey_prop_name: 'code_part', cb: pa => {
                    this['partner_address'] = pa;
                }
            }
        ];
        return packs;
    }
}