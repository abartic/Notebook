
import { BaseEntity, LookupProp, SheetInfo, IEntityInfo } from "./base-entity";
import { Purchase } from "./purchase";

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
            this.has_movements = (<Purchase>parent).has_movements;
            this.code_doc = (<Purchase>parent).code_doc;
        }
    }

    // public adjustProperties(entityInfo: IEntityInfo) {
    //     for (let dprop of ['price_out', 'qty_out']) {
    //         let item = entityInfo.properties.find(i => i.propName === dprop)
    //         item.isHidden = true;
    //     }
    //     return entityInfo;
    // }

    
}