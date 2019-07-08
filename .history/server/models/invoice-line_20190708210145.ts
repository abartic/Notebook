
import { BaseEntity, LookupProp, SheetInfo, IShellInfo, IEntityInfo, IPropInfo } from "./base-entity";
import { Invoice } from "./invoice";
import { eFieldDataType } from "../common/enums";

@SheetInfo("movements", "document_lines", "InvoiceLine")
export class InvoiceLine extends BaseEntity {

    public code_doc: string;

    @LookupProp("article", ["code_art", "descr_art", "UM", "entry_date"])
    public code_art: string;

    @LookupProp("store", ["code_store", "descr_store"])
    public code_store: string;

    public price_out: number;

    private qty_in: number;

    public qty_out: number;

    public discount_perc: number;

    public discount_value: number;

    public tax_perc: number;

    public tax_value: number;

    public move_date: Date;

    public has_movements: boolean;

    public notes: string;

    public onPropValueChanged(property: IPropInfo, propValue: any) {
        let debit = (this.price_out * this.qty_out);
        let discount = 0;   
        let tax = 0;     
        if (property.propName === 'discount_perc') {
            if (this.discount_perc) {
                discount = debit * this.discount_perc / 100;
            }
            this.discount_value = discount;
        }
        else if (property.propName === 'discount_value') {
            if (this.discount_value) {
                discount = this.discount_value * 100 / debit;
            }
            this.discount_perc = discount;
        }
        else if (property.propName === 'tax_perc') {
            if (this.tax_perc) {
                tax = (debit - this.discount_value) * this.tax_perc / 100;
            }
            this.tax_value = tax;
        }
        else if (property.propName === 'tax_value') {
            if (this.tax_value) {
                tax = this.tax_value * 100 / (debit - this.discount_value);
            }
            this.tax_perc = tax;
        }

        return false;
    }

    public onNew(parent: BaseEntity) {
        super.onNew(parent);
        if (parent) {
            this.move_date = (<Invoice>parent).creation_date;
            this.code_store = (<Invoice>parent).code_store;
            this.qty_in = 0;
            this.discount = 0;
            this.tax = 0;
            this.has_movements = (<Invoice>parent).has_movements;
            this.code_doc = (<Invoice>parent).code_doc;
            this.discount_perc = (<Invoice>parent).discount_perc;
            this.tax_perc = (<Invoice>parent).tax_perc;
            
            
        }
    }

    public get debit_value(): number {
        let debit = (this.price_out * this.qty_out);
        let discount = 0;

        if (this.discount_perc) {
            discount = debit * this.discount_perc / 100;
        }
        else if (this.discount_value) {
            discount = this.discount_value
        }

        return debit - discount;
    }

    private _props = null;
    get properties(): Array<IPropInfo> {

        if (this._props === null) {
            this._props = this.entityInfo.properties;

            if (this._props.findIndex(i => i.propName === 'debit_value') < 0) {
                this._props.push(<IPropInfo>{
                    propName: 'debit_value',
                    propCaption: 'debit_value',
                    dataType: eFieldDataType.Numeric,
                    isFilterHidden: true,
                    isCustom: true,
                    isReadOnly : true
                });
            }

        }
        return this._props;
    }
}