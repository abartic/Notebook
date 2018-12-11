// import { KeyedCollection } from './../utils/dictionary';
// import { DriveOperations } from './../drive/drive_operations';
// import { SheetRoute } from "../routes/sheets_route";
// import { IMgrItem } from "./sheets-mgr";
// import * as fs from 'fs';
// import * as path from 'path';
// import { eFileOperationType } from "../sheets/sheets_common_operations";


// export class AccountsMgr {
//     private static _uniqueInstance: AccountsMgr;
//     private data: KeyedCollection<IMgrItem<IAccount>> = new KeyedCollection<IMgrItem<IAccount>>();

//     public getAccount(accessToken: string, domainId: string, accountsFileId: string, userId: string, limitDate : number): Promise<IAccount> {
//         let domainToken = accessToken + '_' + domainId;
//         let account = this.getAccountFromCache(domainToken, userId, limitDate);
//         if (account) {
//             return Promise.resolve(account);
//         }
//         else {
//             return this.readAccount(accessToken, domainId, accountsFileId, userId)
//                 .then((account) => {
//                     if (!account)
//                         return Promise.resolve(null);

//                     return Promise.resolve(account);
//                 }).catch(err => {
//                     return Promise.reject({ error: err });
//                 });
//         }
//     }

//     private AccountsMgr() {
//     }

//     private checkExpiration(key, item: IMgrItem<IAccount>, datelimit?: number) {

//         if (!datelimit) {
//             var dateMinusOneDay = new Date(Date.now());
//             dateMinusOneDay.setDate(dateMinusOneDay.getDate() - 1);
//             datelimit = dateMinusOneDay.valueOf();
//         }

//         if (item.timestamp < datelimit) {
//             this.data.Remove(key);
//             return false;
//         }
//         else {
//             return true;
//         }
//     }

//     private getAccountFromCache(domainToken: string, userId: string, datelimit?: number): IAccount {
//         if (this.data.ContainsKey(domainToken) === true) {
//             let item = this.data.Item(domainToken);
//             if (this.checkExpiration(domainToken, item, datelimit)) {
//                 return item.data;
//             }
//         }

//         return undefined;
//     }

//     private readAccount(accessToken: string, domainId: string, accountsFileId: string, userId: string): Promise<IAccount> {
//         let domainToken = accessToken + '_' + domainId;
//         return DriveOperations.getConfigFile<IAccountsSet>(accessToken, accountsFileId, domainId, eFileOperationType.accounts)
//             .then(accountsset => {
//                 if (!accountsset)
//                     return Promise.resolve(null);

//                 let account : IAccount = null;
//                 for (account of accountsset.accounts) {
//                     if (account.accountName === userId) {
//                         this.data.Add(domainToken, {
//                             fileId: accountsset.domainId,
//                             data: account,
//                             timestamp: Date.now()
//                         });
//                         break;
//                     }
//                 }

//                 return Promise.resolve(account);
//             }).catch(err => {
//                 return Promise.reject(err);
//             });
//     }

//     public static get uniqueInstance(): AccountsMgr {
//         if (AccountsMgr._uniqueInstance === undefined) {
//             AccountsMgr._uniqueInstance = new AccountsMgr();
//         }
//         return AccountsMgr._uniqueInstance;
//     }
// } 