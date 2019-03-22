import { BaseEntity, SheetInfo, IPropInfo } from "./base-entity";
import {eFieldDataType, eTypeBudget } from '../common/enums';
import { ExpenseLine } from './expense-line';
import { ExpensesShell } from '../shells/expenses-shell';
import { ShellInfos } from './modelProperties';

@SheetInfo("budgets", "budget_definitions", "Expenses", ExpensesShell.adjustShellInfo, "code_doc")
export class Expenses extends BaseEntity {



    public code_doc: string;

    public author: string;

    public author_notes: string;

    public title: string;

    private _pivot_by = null;
    public get pivot_by(): string {
        return this._pivot_by;
    }
    public set pivot_by(value: string) {
        this._pivot_by = value;
        this.setPropChanged("pivot_by");
    }

    public type_doc: string;

    public creation_date: Date;

    public notes: string;

    public total: number;

    public debit: number;

    public credit: number;

    public expenseline_relation: (ExpenseLine)[];



    public onNew(parent: BaseEntity) {
        super.onNew(parent);

        this.debit = 0;
        this.credit = 0;
        this.type_doc = eTypeBudget.Expenses;
    }

    private _props = null;
    get properties(): Array<IPropInfo> {

        if (this._props === null) {
            this._props = this.entityInfo.properties;
            
// tslint:disable-next-line: typedef-whitespace
            const pp : Array<string> = ['debit'];
            this._props
                .filter((v, index, array) => {
                    return pp.includes(v.propName, 0)
                })
                .forEach(p => p.isReadOnly = true);


            if (this._props.findIndex(i => i.propName === 'pivot_by_ar') < 0) {
                this._props.push(<IPropInfo>{
                    propName: 'pivot_by_ar',
                    propCaption: 'budget.pivot_by',
                    dataType: eFieldDataType.String,
                    isFilterHidden: true,
                    dropdownlist: [
                        { id: 'notes', itemName: 'expenseline.notes' },
                        { id: 'attr1', itemName: 'expenseline.attr1' },
                        { id: 'attr2', itemName: 'expenseline.attr2' },
                        { id: 'attr3', itemName: 'expenseline.attr3' },
                    ],
                    dropdownsettings: {
                        singleSelection: false,
                        text: "Select",
                        selectAllText: 'Select All',
                        unSelectAllText: 'UnSelect All',
                        enableSearchFilter: false,
                    },
                    customInputType: 'multichecklist',
                    isCustom: true
                });
            }

            if (this._props.findIndex(i => i.propName === 'balance') < 0) {
                this._props.push(<IPropInfo>{
                    propName: 'balance',
                    propCaption: 'balance',
                    dataType: eFieldDataType.Numeric,
                    isFilterHidden: true,
                    isCustom: true,
                    isReadOnly : true
                });
            }

        }
        return this._props;
    }

    public get balance() {
        return (this.credit || 0) - (this.debit || 0);
    }

    _pivot_by_ar = undefined;
    public get pivot_by_ar() {

        if (!this._pivot_by_ar) {
            if (!this.pivot_by) {
                this._pivot_by_ar = [];
            }
            else {
                let values = this.pivot_by.split(',');
                this._pivot_by_ar = values.map(i => { return { id: i, itemName: 'expenseline.' + i }; });
            }
        }
        return this._pivot_by_ar;
    };

    public set pivot_by_ar(value) {
        this.pivot_by = '';
        value.map(i => this.pivot_by += i['id'] + ',');
        if (this.pivot_by.length > 0)
            this.pivot_by = this.pivot_by.slice(0, this.pivot_by.length - 1);
    }

    public onChildrenUpdate() {

        if (this.expenseline_relation) {
            this.debit = 0;
            this.expenseline_relation.map(i => this.debit += i.debit);
        }
    }

    
}

