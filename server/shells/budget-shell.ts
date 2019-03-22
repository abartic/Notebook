
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
                        caption: "LBL.YEAR", 
                        uniqueName: "year",

                    },
                    {
                        dimensionName: "month",
                        caption: "LBL.MONTH",
                        uniqueName: "month",

                    },
                    {
                        dimensionName: "week",
                        caption: "LBL.WEEK",
                        uniqueName: "week",

                    },
                    {
                        dimensionName: "day",
                        caption: "LBL.DAY",
                        uniqueName: "day",

                    }
                ],
                rows: [
                    {
                        dimensionName: "attr1",
                        caption: "LBL.CHAPTER",
                        uniqueName: "attr1",
                    },
                    {
                        dimensionName: "attr2",
                        caption: "LBL.SUBCHAPTER",
                        uniqueName: "attr2",
                    },
                    {
                        dimensionName: "attr3",
                        caption: "LBL.TITLE",
                        uniqueName: "attr3",
                    }
                ],
                measures: [
                    {
                        uniqueName: "debit",
                        caption: "LBL.PROJECTED",
                        aggregation: "SUM"
                    }

                    , {
                        uniqueName: "credit",
                        caption: "LBL.EXECUTED",
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