import { IShellInfo } from './../models/base-entity';
export class CompanyShell
{
    public static adjustShellInfo(shellInfo: IShellInfo) {
        shellInfo.filter.selectFirst = true;
        //shellInfo.filter.commands = [{ caption: 'Refresh', handler: 'onApply', primary : true },];
        shellInfo.commands = [
            { caption: 'BTN.SAVE', handler: 'onSave', image: 'fa fa-floppy-o' },
            { caption: 'BTN.UNDO', handler: 'onUndo', image: 'fa fa-undo' }
        ];
    }
}