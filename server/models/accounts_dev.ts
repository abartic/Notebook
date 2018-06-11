
interface IEntity
{
    entityName: string;
    relations: string[]
}

interface ISheet
{
    sheetName : string;
    sheetID : string;
    entity: IEntity;
}

interface ISpreadsheet
{
    spreadsheetName : string;
    spreadsheetID : string,
    sheets : Array<ISheet>
}

interface ISpreadsheetsSet
{
    accountsFileId : string,
    spreadsheets : Array<ISpreadsheet>
}

interface IAccount
{
    accountName : string,
    accountDescr : string,
    enrollmentDate : number,
    role : string,
}

interface IAccountsSet
{
    id : string,
    accounts : Array<IAccount>
}
