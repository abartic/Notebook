import { eTypeBudget } from '../common/enums';

export class BudgetShell
{

    public static adjustShellInfo(shellInfo) {
        shellInfo.filter.static_filter = [{ key: 'type_doc', value: eTypeBudget.Budget }];
        shellInfo.properties = [{ name: 'pivot_by_ar', datatype: 'string', isReadOnly: false }];
        shellInfo.pivotInfo = {
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
}