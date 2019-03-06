import { IShellInfo } from '../models/base-entity';
export class ArticleInventoryShell
{

    public static adjustShellInfo(shellInfo : IShellInfo) {
        shellInfo.commands = [];
        //shellInfo.filter.commands = [{ caption: 'Refresh', handler: 'onApply', primary : true },];
    }
}