
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

interface IAccount
{
    accountName : string,
    accountDescr : string,
    spreadsheets: Array<ISpreadsheet>
}
