
interface IEntity
{
    entityName: string;
    relations: string[],
    hidden_fields : string[],
    caption_prefix? : string
}

interface ISheet
{
    sheetName : string;
    sheetID : string;
    fields : string[],
    fields_types : string[],
    hidden_fields : string[],
    entities: IEntity[];
    isView? : boolean;
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
interface IDomain
{
    domainName : string;
    domainId : string;
    admin : IAccount;
    isActive : boolean;
}

interface IAccount
{
    accountName : string,
    accountDescr : string,
    enrollmentDate : number,
    role : string,
    domainId : string,
}

interface IAccountsSet
{
    id : string,
    //domainId : string,
    accounts : Array<IAccount>
}
