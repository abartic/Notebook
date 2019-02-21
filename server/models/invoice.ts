import { InvoiceLine } from './invoice-line';
import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo, IEntityInfo } from "./base-entity";
import { eTypeMovement } from '../common/enums';
import { Partner } from './partner';


@SheetInfo("movements", "documents", "Invoice", "code_doc")
export class Invoice extends BaseEntity {

    public code_doc: string;

    @LookupProp("partner", ["code_part", "name_partner", "descr_partner"])
    public code_part: string;

    public type_doc: string;

    public currency: string;

    public creation_date: Date;

    public due_date: Date;

    public register_date: Date;

    public internal_reference: string;

    @LookupProp("store", ["code_store", "descr_store"])
    public code_store: string;

    public has_movements: boolean;

    public has_payments: boolean;

    public discount_perc: number;

    public tax_perc: number;

    public discount_value: number;

    public tax_value: number;

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
        this.tax_value = 0;
        this.discount_value = 0;

        this.invoiceline_relation.map(i => {
            let debit = (i.price_out * i.qty_out);
            let discount = 0;

            if (i.discount_perc) {
                discount = (i.price_out * i.qty_out) * i.discount_perc / 100;
            }
            else if (i.discount_value) {
                discount = i.discount_value
            }

            debit = debit - discount;

            if (i.tax_value)
                this.tax_value += i.tax_value
            else if (i.tax_perc)
                this.tax_value += ((debit * i.tax_perc) / 100);

            this.debit_value += debit;
            this.discount_value += discount;
        });
    }

    public adjustShellInfo() {
        this.shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.StocksOutput }];
        this.shellInfo.filter.commands[2].isDisabled = false;
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

    public getReportType(): any {
        if (this['partner_lookup_entity'] && (<Partner>this['partner_lookup_entity']).invoice_report_type)
            return (<Partner>this['partner_lookup_entity']).invoice_report_type;
        else
            return this.entityName.toLocaleLowerCase();
    }
}