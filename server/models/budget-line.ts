
import { BaseEntity, LookupProp, SheetInfo, IShellInfo, IEntityInfo } from "./base-entity";


@SheetInfo("budgets", "budget_lines", "BudgetLine")
export class BudgetLine extends BaseEntity {
    

    constructor() { 
        super();
        this.fetchAll = true;
    }

    public code_doc: string;
    public attr1: string;
    public attr2: string;
    public attr3: string;


    public debit: number;
    public credit: number;

    public year: number;
    public month: number;
    public week: number;
    public day: number;

    public notes: string;

    public onNew(parent: BaseEntity) {
        super.onNew(parent);
        this.attr1 = this.attr2 = this.attr3 = undefined;
        this.year = this.month = this.week = this.day = undefined;
        this.debit = this.credit = undefined;
        this['_row_'] = {};
        Object.assign(this['_row_'], this);
    }

    public compareForValidation(entity: BaseEntity) {
        let other = <BudgetLine>entity;
        if (!other)
            return false;
        if (other.uid === this.uid)
            return true;
        return (this.year || 0) === (other.year || 0) &&
            (this.month || 0) === (other.month || 0) &&
            (this.week || 0) === (other.week || 0) &&
            (this.day || 0) === (other.day || 0) &&
            (this.attr1 || '') === (other.attr1 || '') &&
            (this.attr2 || '') === (other.attr2 || '') &&
            (this.attr3 || '') === (other.attr3 || '');

    }
}