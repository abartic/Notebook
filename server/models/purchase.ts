
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

    public has_movements: boolean;

    public has_payments: boolean;

    public debit_value : number;

    public credit_value : number;

    public notes : string;

    public partner_notes : string;

    public type_movement : string;

    public purchaseline_relation: (PurchaseLine)[];

    public onPrepareSave()
    {
        this.credit_value = 0;
        this.purchaseline_relation.map(i=>this.credit_value += i.price_in * i.qty_in);
    }

    public getShellInfo(): IShellInfo {
        return {
            filter: {
                fields: {
                    add: [],
                    remove: []
                },
                static_filter: [{ key: 'type_movement', value: eTypeMovement.StocksInput }]
            },
            commands: {
                add: [],
                remove: []
            },
            report: {
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
            }

        };
    }

    public onInit(parent: BaseEntity)
    {
        super.onInit(parent);
        this.has_movements = true;
        this.has_payments = true;
        this.debit_value = 0;
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
}