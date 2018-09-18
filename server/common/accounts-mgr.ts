import { SheetRoute } from "../routes/sheets_route";
import { IMgrItem } from "./sheets-mgr";
import * as fs from 'fs';
import * as path from 'path';
import { DriverRoute } from "../routes/driver_route";
import { eFileOperationType } from "../sheets/sheets_common_operations";


export class AccountsMgr {
    private static _uniqueInstance: AccountsMgr;
    private data: Array<IMgrItem<IAccountsSet>> = new Array<IMgrItem<IAccountsSet>>();

    private AccountsMgr() {
    }

    private checkExpiration(item: IMgrItem<IAccountsSet>) {

        var dateMinusOneDay = new Date(Date.now());
        dateMinusOneDay.setDate(dateMinusOneDay.getDate() - 1);
        if (item.timestamp < dateMinusOneDay.valueOf()) {
            this.data
                .map((i, index, a) => {
                    if (i.timestamp < dateMinusOneDay.valueOf())
                        this.data.splice(index, 1);
                });

            return false;
        }
        else {
            return true;
        }
    }

    private getAccountFromCache(token: string, userId: string): IAccount {
        var item = this.data.find(s => s.token === token);
        if (item && this.checkExpiration(item)) {
            return item.data.accounts.find(u => u.accountName === userId)
        }
        else {
            return undefined;
        }
    }

    private getAccountsFromCache(token: string): IAccountsSet {
        var item = this.data.find(s => s.token === token);
        if (item && this.checkExpiration(item)) {
            return item.data;
        }
        else {
            return undefined;
        }
    }

    private readAccounts(token: string, accountsFileId: string): Promise<IAccountsSet> {
        return DriverRoute.getConfigFile<IAccountsSet>(token, accountsFileId, eFileOperationType.accounts)
            .then(accountsset => {
                if (!accountsset)
                    return Promise.resolve(null);

                this.data.push({
                    token: token,
                    fileId: accountsset.id,
                    data: accountsset,
                    timestamp: Date.now()
                });

                return Promise.resolve(accountsset);
            }).catch(err => {
                return Promise.reject(err);
            });
    }

    public getAccounts(token: string, accountsFileId: string): Promise<IAccountsSet> {
        let accountsSet = this.getAccountsFromCache(token);
        if (accountsSet) {
            return Promise.resolve(accountsSet);
        }
        else {
            return this.readAccounts(token, accountsFileId);
        }

    }

    public getAccount(token: string, accountsFileId: string, userId: string): Promise<IAccount> {
        let account = this.getAccountFromCache(token, userId);
        if (account) {
            return Promise.resolve(account);
        }
        else {
            return this.readAccounts(token, accountsFileId).then((accountsSet) => {
                if (!accountsSet)
                    return Promise.resolve(null);

                let account = this.getAccountFromCache(token, userId);
                return Promise.resolve(account);
            });
        }
    }

    public static get uniqueInstance(): AccountsMgr {
        if (AccountsMgr._uniqueInstance === undefined) {
            AccountsMgr._uniqueInstance = new AccountsMgr();
        }
        return AccountsMgr._uniqueInstance;
    }
} 