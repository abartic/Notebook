
import { BaseEntity, IPropInfo, IEntityInfo, IShellInfo } from './../../../../server/models/base-entity';

export interface IPackageController {
    
    package;

    filterItems;

    filterProperties;

    entityType: string;

    package_initialized: boolean;

    

    onClear();

    onApplyFilter();

    onAddFilterCond(selectedFilterCond: { entityName: string, property: IPropInfo }, filterCondValue);

    executeFilter();

    executeLookupFilter(lookup_entity_name: string, filterItems: { filterCondition: {entityName: string, property: IPropInfo}; filterConditionValue: string; }[], reset: boolean);

    onSelectEntity(row);

    onNew();

    onSave();

    onDelete();

    onUndo();

    onPrint();

    onShowCalendar();

    openLookupWnd(lookupSource: BaseEntity, lookupSourceProperty: IPropInfo);

    

    getRelationProperties(relation: string, addLookups: boolean, addEntityName: boolean);

    getRelationFilterProperties();

    onCreateEntityByRelation(relation: string, validation?: () => boolean, cb?: () => void);

    onEditEntityByRelation(entity: BaseEntity, relation: string, validation?: () => boolean, cb?: () => void);

    isDisabled(entity, property);

    entityInfo: IEntityInfo;

    shellInfo: IShellInfo;

    //filterCommands: any;

}