
import { BaseEntity, LookupProp, SheetInfo, IEntityInfo, IPropInfo } from "./base-entity";
import { Purchase } from "./purchase";
import { eFieldDataType } from "../common/enums";

@SheetInfo("movements", "document_lines","PurchaseLine")
export class PurchaseLine extends BaseEntity {

    public code_doc : string;

    @LookupProp("article", ["code_art", "descr_art", "UM", "entry_date"])
    public code_art : string;
    
    @LookupProp("store", ["code_store", "descr_store"])
    public code_store: string;

    public price_in : number;
    
    public qty_in : number;

    private qty_out : number;

    public discount_perc: number;

    public discount_value: number;

    public tax_perc: number;

    public tax_value: number;

    public discount : number;
    
    public move_date : Date;

    public has_movements : boolean;

    public notes : string;
    
    public onNew(parent : BaseEntity)
    {
        super.onNew(parent);
        if (parent){
            this.move_date = (<Purchase>parent).creation_date;
            this.code_store = (<Purchase>parent).code_store;
            this.qty_out = 0;
            this.discount_value = 0;
            this.tax_value = 0;
            this.has_movements = (<Purchase>parent).has_movements;
            this.code_doc = (<Purchase>parent).code_doc;
            this.discount_perc = (<Purchase>parent).discount_perc || 0;
            this.tax_perc = (<Purchase>parent).tax_perc || 0;
        }
    }

    public get credit_value(): number {
        let credit = (this.price_in * this.qty_in);
        let discount = 0;

        if (this.discount_perc) {
            discount = credit * this.discount_perc / 100;
        }
        else if (this.discount_value) {
            discount = this.discount_value
        }

        return credit - discount;
    }

    private _props = null;
    get properties(): Array<IPropInfo> {

        if (this._props === null) {
            this._props = this.entityInfo.properties;

            if (this._props.findIndex(i => i.propName === 'credit_value') < 0) {
                this._props.push(<IPropInfo>{
                    propName: 'credit_value',
                    propCaption: 'credit_value',
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