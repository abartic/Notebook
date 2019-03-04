
import { BaseEntity, IPropInfo, IEntityInfo, IShellInfo } from './../../../../server/models/base-entity';

export interface IPackageController {
    filterCommands: any;

    package;

    filterItems;

    filterProperties;

    entityType: string;

    package_initialized: boolean;

    canExecuteNew: boolean;

    onClear();

    onApply();

    onAddFilterCond(selectedFilterCond: {entityName: string, property: IPropInfo}, filterCondValue);

    executeFilter();

    checkFilter();

    executeLookupFilter(count?: boolean);

    onSelectEntity(row);

    onNew();

    onSave();

    onDelete();

    onUndo();

    onPrint();

    onShowCalendar();

    openLookupWnd(lookupSource: BaseEntity, lookupSourceProperty: IPropInfo);

    lookupProperties(lookupEntity: BaseEntity, lookupProperties: string[]);

    getRelationProperties(relation: string, addLookups: boolean, addEntityName: boolean);

    getRelationFilterProperties();

    onCreateEntityByRelation(relation: string, validation?: () => boolean, cb?: () => void);

    onEditEntityByRelation(entity: BaseEntity, relation: string, validation?: () => boolean, cb?: () => void);

    isDisabled(entity, property);
    
    entityInfo : IEntityInfo;

    shellInfo : IShellInfo;

}