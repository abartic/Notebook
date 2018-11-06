
import { BaseEntity, LookupProp, SheetInfo, IShellInfo, IEntityInfo } from "./base-entity";
import { Expenses } from "./expenses";


@SheetInfo("budgets", "budget_lines", "ExpenseLine")
export class ExpenseLine extends BaseEntity {


    constructor() {
        super();
        this.fetchAll = true;
    }

    public code_doc: string;
    public attr1: string;
    public attr2: string;
    public attr3: string;
    
    public debit: number;
    public notes: string;

    

    public onNew(parent: BaseEntity) {
        super.onNew(parent);
    
        this.attr1 = this.attr2 = this.attr3 = undefined;
        this.debit = undefined;
        this['_row_'] = {};
        Object.assign(this['_row_'], this);
    }

    public compareForValidation(entity: BaseEntity) {
        let other = <ExpenseLine>entity;
        if (!other)
            return false;
        if (other.uid === this.uid)
            return true;
        return (this.attr1 || '') === (other.attr1 || '') &&
            (this.attr2 || '') === (other.attr2 || '') &&
            (this.attr3 || '') === (other.attr3 || '');

    }
}