import { InvoiceLine } from './invoice-line';
import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';


import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo } from "./base-entity";
import { Partner } from './partner';
import { eTypeMovement } from '../common/enums';

@SheetInfo("movements", "documents", "Receivable", "code_doc")
export class Receivable extends BaseEntity {

    public code_doc: string;

    @LookupProp("partner", ["code_part", "name_partner", "descr_partner"])
    public code_part: string;

    public type_doc: string;

    public creation_date: Date;

    public due_date: Date;

    public register_date: Date;

    public internal_reference: string;

    @LookupProp("store", ["code_store", "descr_store"])
    public code_store: string;

    public has_movements: boolean;

    public has_payments: boolean;

    public debit_value: number;

    public credit_value: number;

    public notes: string;

    public partner_notes: string;

    public type_movement: string;

    public adjustShellInfo() {
        this.shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.Receivable }];
        this.shellInfo.commands =this.shellInfo.commands.concat([
            { caption: 'Print', handler: 'onPrint' },
        ]);
        this.shellInfo.report = {
            preloads: [
                {
                    entity_name: 'partner', ukey_prop_name: 'code_part', cb: p => {
                        this['partner_lookup_entity'] = p;
                    }
                }
            ]
        };
    }

    public onNew(parent: BaseEntity) {
        super.onNew(parent);
        this.has_movements = true;
        this.has_payments = true;
        this.debit_value = 0;
        this.credit_value = 0;
        this.type_movement = eTypeMovement.Receivable;
    }
}