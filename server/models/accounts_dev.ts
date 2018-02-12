

// import * as AccountsBase from "./accounts.js";
// import * as Sequelize from 'sequelize';
// import { Db } from './db'

interface Sheet
{
    sheetName : String;
    sheetID : String
}

interface Spreadsheet
{
    spreadsheetName : String;
    spreadsheetID : String,
    sheets : Array<Sheet>
}

interface Account
{
    accountName : String,
    accountDescr : String,
    spreadsheets: Array<Spreadsheet>
}

// export class Accounts {

//     static model : Sequelize.Model<Account, {}>;

//     constructor(db: Db) {

//         if (Accounts.model == null)
//             Accounts.model = db.sequelize.import<Account,{}>('accounts', AccountsBase);
//     }

//     checkUser(emails?: Array<{
//         value: string;
//         type?: string;
//     }>) {

//         var accounts = emails.map(e => e.value);
//         return Accounts.model.findOne({
//             attributes: ['id'],
//             where: { 'accountName': { $any: accounts } }
//         }).then(record => {
//            return record != null;
//         });

//     }
// }