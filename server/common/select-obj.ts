export interface ISelectObj {
    spreadsheetName: string;
    sheetName: string;
    entityName: string;
    select: string;
    addSchema: boolean;
}

export interface IEntityPackage
{ 
    sheetName, 
    sheetID, 
    ID, 
    rowid,
    selectEntity, 
    values,
    action
}

export interface IEntitiesPackage
{ 
    spreadsheetID,
    spreadsheetName,
    entityPackages : IEntityPackage[],
    action,
}