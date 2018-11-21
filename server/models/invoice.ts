import { InvoiceLine } from './invoice-line';
import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';


import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo, IEntityInfo } from "./base-entity";
import { Partner } from './partner';
import { eTypeMovement } from '../common/enums';
import { Observable } from 'rxjs/Observable';
import { ModelFactory } from './modelFactory';

@SheetInfo("movements", "documents", "Invoice", "code_doc")
export class Invoice extends BaseEntity {

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

    public invoiceline_relation: (InvoiceLine)[];

    public onPropValueChanged(property: IPropInfo, propValue: any) {
        let cascade_values = false;
        if (property.propName === 'has_movements' || property.propName === 'creation_date') {
            this.invoiceline_relation.map(i => {
                i.has_movements = this.has_movements;
                i.move_date = this.creation_date;
            });
            cascade_values = true;
        }

        return cascade_values;
    }

    public onPrepareSave() {
        this.debit_value = 0;
        this.invoiceline_relation.map(i => this.debit_value += i.price_out * i.qty_out);
    }

    public adjustShellInfo() {
        this.shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.StocksOutput }];
        this.shellInfo.filter.commands[2].isDisabled = true; 
        this.shellInfo.commands = this.shellInfo.commands.concat([
            { caption: 'Print', handler: 'onPrint' },
        ]);
        this.shellInfo.report = {
            preloads: [
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
            ]
        };
    }



    public onNew(parent: BaseEntity) {
        super.onNew(parent);
        this.has_movements = true;
        this.has_payments = true;
        this.debit_value = 0;
        this.credit_value = 0;
        this.invoiceline_relation = [];
        this.type_movement = eTypeMovement.StocksOutput;
    }


}