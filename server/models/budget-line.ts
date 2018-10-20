
import { BaseEntity, LookupProp, SheetInfo, IShellInfo, IEntityInfo } from "./base-entity";


@SheetInfo("budgets", "budget_lines", "BudgetLine")
export class BudgetLine extends BaseEntity {

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

    public notes : string;
    
    
}