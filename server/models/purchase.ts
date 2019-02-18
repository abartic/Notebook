
import { PurchaseLine } from './purchase-line';
import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';


import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo } from "./base-entity";
import { Partner } from './partner';
import { eTypeMovement } from '../common/enums';

@SheetInfo("movements", "documents", "Purchase", "code_doc")
export class Purchase extends BaseEntity {

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

    public currency: string;
    
    public has_movements: boolean;

    public has_payments: boolean;

    public debit_value: number;

    public credit_value: number;

    public discount_perc: number;

    public tax_perc: number;

    public discount_value: number;

    public tax_value: number;

    public notes : string;

    public partner_notes : string;

    public type_movement : string;

    public purchaseline_relation: (PurchaseLine)[];

    public onPrepareSave() {
        this.credit_value = 0;
        this.tax_value = 0;
        this.discount_value = 0;

        this.purchaseline_relation.map(i => {
            let debit = (i.price_in * i.qty_in);
            let discount = 0;

            if (i.discount_perc) {
                discount = (i.price_in * i.qty_in) * i.discount_perc / 100;
            }
            else if (i.discount_value) {
                discount = i.discount_value
            }

            debit = debit - discount;

            if (i.tax_value)
                this.tax_value += i.tax_value
            else if (i.tax_perc)
                this.tax_value += ((debit * i.tax_perc) / 100);

            this.credit_value += debit;
            this.discount_value += discount;
        });
    }

    public adjustShellInfo() {
        this.shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.StocksInput }];
        this.shellInfo.filter.commands[2].isDisabled = false;
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

    public onNew(parent: BaseEntity)
    {
        super.onNew(parent);
        this.has_movements = true;
        this.has_payments = true;
        this.credit_value = 0;
        this.credit_value = 0;
        this.purchaseline_relation = [];
        this.type_movement  = eTypeMovement.StocksInput;
    }
   
    public onPropValueChanged(property: IPropInfo, propValue : any)
    {
        let cascade_values = false;
        if (property.propName === 'has_movements' || property.propName === 'creation_date')
        {
            this.purchaseline_relation.map(i=> {
                i.has_movements = this.has_movements;
                i.move_date = this.creation_date;
            });
             cascade_values = true;
        }
        return cascade_values;
    }


    private _props: Array<IPropInfo> = null;
    get properties(): Array<IPropInfo> {
        if (this._props === null) {
            this._props = this.entityInfo.properties;

            let pp : Array<string> = ['debit_value', 'discount_value', 'tax_value'];
            this._props
                .filter((v, index, array) => {
                    return pp.includes(v.propName, 0)
                })
                .forEach(p => p.isReadOnly = true)

        }
        return this._props;
    }
}