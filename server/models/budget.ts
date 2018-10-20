import { InvoiceLine } from './invoice-line';
import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';


import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo, RelationProp } from "./base-entity";
import { Partner } from './partner';
import { eTypeMovement } from '../common/enums';
import { BudgetLine } from './budget-line';

@SheetInfo("budgets", "budget_definitions", "Budget", "code_doc")
export class Budget extends BaseEntity {

    public code_doc: string;

    public author: string;

    public title: string;

    public pivot_by: string;

    public type_doc: string;

    public creation_date: Date;

    public notes : string;

    public balance : number;

    @RelationProp(["attr1", "attr2", "attr3"], ["month"])
    public budgetline_relation: (BudgetLine)[];

    
    public getShellInfo(): IShellInfo {
        return {
            filter: {
                fields: {
                    add: [],
                    remove: []
                },
                static_filter: []
            },
            properties: [],
            commands: {
                add: [],
                remove: []
            },
            report: {
                preloads: []
            }

        };
    }
   
}