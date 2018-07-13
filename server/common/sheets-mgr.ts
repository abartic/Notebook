import { SheetRoute, eFileOperationType } from "../routes/sheets_route";
import { DriverRoute } from "../routes/driver_route";

export interface IMgrItem<T> {
    token: string;
    fileId: string;
    timestamp: number;
    data: T;
}

export class SheetsMgr {
    private static _uniqueInstance: SheetsMgr;
    private data: Array<IMgrItem<ISpreadsheetsSet>> = new Array<IMgrItem<ISpreadsheetsSet>>();


    public get(token: string): Promise<ISpreadsheetsSet> {

        var item = this.data.find(s => s.token === token);
        if (!item) {
            return DriverRoute.getConfigFile<ISpreadsheetsSet>(token, null, eFileOperationType.sheets)
                .then(spreadsheetsSet => {
                    if (!spreadsheetsSet)
                        return Promise.resolve(null);
                        
                    var dateMinusOneDay = new Date(Date.now());
                    dateMinusOneDay.setDate(dateMinusOneDay.getDate() - 1);
                    this.data.map((i, index, a) => i.timestamp < dateMinusOneDay.getTime() ? index : -1)
                        .forEach(index => this.data.splice(index, 1));

                    var setByFileId = this.data.find(s => s.fileId === spreadsheetsSet.accountsFileId);
                    var set : ISpreadsheetsSet;
                    if (setByFileId) {
                        set = setByFileId.data;
                    }
                    else {
                        set = spreadsheetsSet;
                    }

                    this.data.push({
                        token: token,
                        fileId: set.accountsFileId,
                        data: set,
                        timestamp: Date.now()
                    });
                    return Promise.resolve(set);
                }).catch(err => {
                    return Promise.reject(err);
                });
        }
        else {
            return Promise.resolve(item.data);
        }

    }

    public static get uniqueInstance(): SheetsMgr {
        if (SheetsMgr._uniqueInstance === undefined) {
            SheetsMgr._uniqueInstance = new SheetsMgr();
        }
        return SheetsMgr._uniqueInstance;
    }
} 