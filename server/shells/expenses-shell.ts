import { IShellInfo } from './../models/base-entity';
import { eTypeBudget } from '../common/enums';

export class ExpensesShell
{
    public static adjustShellInfo(shellInfo: IShellInfo ) {
        shellInfo.filter.static_filter = [{ key: 'type_doc', value: eTypeBudget.Expenses }];
        shellInfo.filter.sortFields = ["code_doc","author","title", "creation_date"];
        shellInfo.properties = [{ name: 'pivot_by_ar', datatype: 'string', isReadOnly: false }];
        shellInfo.commands = shellInfo.commands.concat([
            { caption: 'BTN.PRINT', handler: 'onPrint', image: 'fa fa-print' },
        ]);
        shellInfo.pivotInfo = {
            slice: {
                columns: [],
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
                        caption: "LBL.VALUE",
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