import { IShellInfo } from './../models/base-entity';
import { eTypeBudget } from '../common/enums';

export class ExpensesShell
{
    public static adjustShellInfo(shellInfo: IShellInfo ) {
        shellInfo.filter.static_filter = [{ key: 'type_doc', value: eTypeBudget.Expenses }];
        shellInfo.properties = [{ name: 'pivot_by_ar', datatype: 'string', isReadOnly: false }];
        // shellInfo.filter.commands = [
        //     { caption: 'Apply', handler: 'onApply', primary: true },
        //     { caption: 'Clear', handler: 'onClear' },
        //     { caption: 'New', handler: 'onNew' },
        // ];
        shellInfo.commands = shellInfo.commands.concat([
            { caption: 'Print', handler: 'onPrint', image: 'fa fa-print' },
        ]);
        shellInfo.pivotInfo = {
            slice: {
                columns: [],
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
                        caption: "Value",
                        aggregation: "SUM"
                    }


                ],
                expands: {
                    expandAll: true,

                }
            }
        }
    }
}