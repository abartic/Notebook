import { IShellInfo } from '../models/base-entity';
export class ArticleShell
{

    public static adjustShellInfo(shellInfo : IShellInfo) {
        
        shellInfo.filter.sortFields = ["code_art","descr_art","UM", "EAN", "SN", "attr1", "attr2", "attr3", "attr4", "attr5"];
    }
}