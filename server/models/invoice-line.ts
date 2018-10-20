
import { BaseEntity, LookupProp, SheetInfo, IShellInfo, IEntityInfo } from "./base-entity";
import { Invoice } from "./invoice";

@SheetInfo("movements", "document_lines", "InvoiceLine")
export class InvoiceLine extends BaseEntity {

    public code_doc: string;

    @LookupProp("article", ["code_art", "descr_art", "UM", "entry_date"])
    public code_art: string;

    @LookupProp("store", ["code_store", "descr_store"])
    public code_store: string;

    public price_out: number;

    private qty_in : number;

    public qty_out: number;

    public discount: number;

    public move_date: Date;

    public has_movements : boolean;

    public notes : string;
    
    public onNew(parent: BaseEntity) {
        if (parent) {
            this.move_date = (<Invoice>parent).creation_date;
            this.code_store = (<Invoice>parent).code_store;
            this.qty_in = 0;
            this.has_movements = (<Invoice>parent).has_movements;
            this.code_doc = (<Invoice>parent).code_doc;
            
        }
    }

    // public adjustProperties(entityInfo: IEntityInfo) {
        
    //     for (let dprop of ['price_in', 'qty_in']) {
    //         let item = entityInfo.properties.find(i => i.propName === dprop)
    //         item.isHidden = true;

    //     }
    //     return entityInfo;
    // }
}