import { IShellInfo } from '../models/base-entity';
export class ArticleInventoryShell
{

    public static adjustShellInfo(shellInfo : IShellInfo) {
        shellInfo.commands = [];
        shellInfo.filter.sortFields = ["code_art","code_store","qty_in", "qty_out", "qty_net"];
    }
}