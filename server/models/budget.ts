import { InvoiceLine } from './invoice-line';
import { ModelInfos } from './modelProperties';
import { ISelectObj } from './../common/select-obj';


import { BaseEntity, SheetInfo, LookupProp, IShellInfo, IPropInfo } from "./base-entity";
import { Partner } from './partner';
import { eTypeMovement, eFieldDataType, eTypeBudget } from '../common/enums';
import { BudgetLine } from './budget-line';

@SheetInfo("budgets", "budget_definitions", "Budget", "code_doc")
export class Budget extends BaseEntity {



    public code_doc: string;

    public author: string;

    public title: string;

    private _pivot_by = null;
    public get pivot_by(): string {
        return this._pivot_by;
    }
    public set pivot_by(value: string) {
        this._pivot_by = value;
        this.requestShellInfoSliceRefresh = true;
    }

    public type_doc: string;

    public creation_date: Date;

    public notes: string;

    public balance: number;


    public budgetline_relation: (BudgetLine)[];

    public adjustShellInfo() {
        this.shellInfo.filter.static_filter = [{ key: 'type_doc', value: eTypeBudget.Budget }];
        this.shellInfo.properties = [{ name: 'pivot_by_ar', datatype: 'string', isReadOnly: false }];
        this.shellInfo.pivotInfo = {
            slice: {
                columns: [
                    {
                        dimensionName: "year",
                        caption: "year",
                        uniqueName: "year",

                    },
                    {
                        dimensionName: "month",
                        caption: "month",
                        uniqueName: "month",

                    },
                    {
                        dimensionName: "week",
                        caption: "week",
                        uniqueName: "week",

                    },
                    {
                        dimensionName: "day",
                        caption: "day",
                        uniqueName: "day",

                    }
                ],
                rows: [
                    {
                        dimensionName: "attr1",
                        caption: "Chapter",
                        uniqueName: "attr1",
                    },
                    {
                        dimensionName: "attr2",
                        caption: "Sub-chapter",
                        uniqueName: "attr2",
                    },
                    {
                        dimensionName: "attr3",
                        caption: "Title",
                        uniqueName: "attr3",
                    }
                ],
                measures: [
                    {
                        uniqueName: "debit",
                        caption: "Projected",
                        aggregation: "SUM"
                    }

                    , {
                        uniqueName: "credit",
                        caption: "Executed",
                        aggregation: "SUM"
                    }
                ],
                expands: {
                    expandAll: true,

                }
            }
        };
    }


    public onNew(parent: BaseEntity) {
        super.onNew(parent);
        this.balance = 0;
        this.type_doc = eTypeBudget.Budget;
    }


    public getAdjustedShellInfoSlice() {

       this.requestShellInfoSliceRefresh = false;

        if (!this.pivot_by || this.pivot_by === '')
            return [];

        let fields = this.pivot_by.split(',').map(f => f.trim());
        let slice = JSON.parse(JSON.stringify(this.shellInfo.pivotInfo.slice));
        let row_delete = [];
        for (let row of slice.rows) {
            let index = fields.findIndex(f => f === row.uniqueName);
            if (index < 0)
                row_delete.push(row);
        }
        row_delete.forEach(r => {
            slice.rows = slice.rows.filter(e => e !== r);
        });

        let column_delete = [];
        for (let column of slice.columns) {
            let index = fields.findIndex(f => f === column.uniqueName);
            if (index < 0)
                column_delete.push(column);
        }
        column_delete.forEach(c => {
            slice.columns = slice.columns.filter(e => e !== c);
        });

        return slice;
    }

    private _props = null;
    get properties(): Array<IPropInfo> {

        if (this._props === null) {
            this._props = this.entityInfo.properties;

            let index = this._props.findIndex(i => i.propName === 'balance')
            if (index >= 0)
                this._props[index].isReadOnly = true;


            if (this._props.findIndex(i => i.propName === 'pivot_by_ar') < 0) {
                this._props.push(<IPropInfo>{
                    propName: 'pivot_by_ar',
                    propCaption: 'budget.pivot_by',
                    dataType: eFieldDataType.String,
                    isFilterHidden: true,
                    dropdownlist: [
                        { id: 'year', itemName: 'budgetline.year' },
                        { id: 'month', itemName: 'budgetline.month' },
                        { id: 'week', itemName: 'budgetline.week' },
                        { id: 'day', itemName: 'budgetline.day' },

                        { id: 'attr1', itemName: 'budgetline.attr1' },
                        { id: 'attr2', itemName: 'budgetline.attr2' },
                        { id: 'attr3', itemName: 'budgetline.attr3' },
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

        }
        return this._props;
    }

    _pivot_by_ar = undefined;
    public get pivot_by_ar() {

        if (!this._pivot_by_ar) {
            if (this.pivot_by === undefined) {
                this._pivot_by_ar = [];
            }
            else {
                let values = this.pivot_by.split(',');
                this._pivot_by_ar = values.map(i => { return { id: i, itemName: 'budgetline.' + i }; });
            }
        }

        return this._pivot_by_ar;
    };

    public set pivot_by_ar(value) {
        this.pivot_by = '';
        value.map(i => this.pivot_by += i['id'] + ',');
        if (this.pivot_by.length > 0)
            this.pivot_by = this.pivot_by.slice(0, this.pivot_by.length - 1);
    };

    public onChildrenUpdate() {

        if (this.budgetline_relation) {
            this.balance = 0;
            this.budgetline_relation.map(i => this.balance += (i.debit - i.credit));
        }
    }
}

