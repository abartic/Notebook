import { BaseEntity } from '../../../../server/models/base-entity';
import { KeyedCollection } from '../../../../server/utils/dictionary';
import { ISelectObj } from '../../../../server/common/select-obj';


export class Package<T extends BaseEntity> {
    
    
    
    // public row_pages : Array<number> = [];
    // public row_current_page : number = 0;

    public filter_items_max : number = 25;
    public show_filter : boolean = true;
    public filter_last_index: number;
    public selected_entity: T;
    public filter_rows : T[];

    public entity : T;
    public entity_relation: BaseEntity;
    public validations : KeyedCollection<ISelectObj>;

    public error_msg : string = '';
    public entity_status_msg : string = '';

    public lookup_entity_name : string;
    public lookup_filter : BaseEntity;
    public lookup_rows : Array<BaseEntity> = [];
    public lookup_row_pages : Array<number> = [];
    public lookup_row_current_page : number = 0;

    public filter_loading : boolean= false;
    public lookup_loading : boolean= false;
    

    public constructor(type : new() => T) {
        this.filter_rows = [];
    }
     
}
