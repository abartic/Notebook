import { IShellInfo } from './../models/base-entity';
export class CompanyShell
{
    public static adjustShellInfo(shellInfo: IShellInfo) {
        shellInfo.filter.autoApply = true;
        shellInfo.filter.commands = [{ caption: 'Refresh', handler: 'onApply', primary : true },];
        shellInfo.commands = [
            { caption: 'Save', handler: 'onSave', primary : true },
            { caption: 'Undo', handler: 'onUndo' }
        ];
    }
}