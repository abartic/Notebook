import { BaseEntity } from '../../../../server/models/base-entity';
import { KeyedCollection } from '../../../../server/utils/dictionary';
import { ISelectObj } from '../../../../server/common/select-obj';


export class Package<T extends BaseEntity> {
    

    public fetched_items_max : number = 25;
    public show_filter : boolean = true;
    public filter_last_index: number;
    public selected_entity: T;
    public filter_rows : T[] = [];
    public filter_fetch_completed: boolean;

    public entity : T;
    public entity_relation: BaseEntity;
    public validations : KeyedCollection<ISelectObj>;
    public canExecuteNew: boolean;

    public error_msg : string = '';
    public entity_status_msg : string = '';

    public lookup_rows : Array<BaseEntity> = [];
    public lookup_loading : boolean= false;
    lookup_fetch_completed: boolean;
    lookup_last_index: number;
    
    

    public constructor(type : new() => T) {
        
    }
     
}
