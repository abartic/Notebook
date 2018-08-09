
import { ModelFactory } from './../../../../server/models/modelFactory';
import { BaseEntity, eEntityStatus, IPropInfo } from '../../../../server/models/base-entity';
import { KeyedCollection } from '../../../../server/utils/dictionary';
import { ISelectObj } from '../../../../server/common/select-obj';


export class Package<T extends BaseEntity> {

    
    
    public selected_entity: T;
    public rows : T[];
    public filter : T;
    public filter_details;
    public entity : T;
    public row_pages : Array<number> = [];
    public row_current_page : number = 0;

    public row_page_max : number = 25;
    public show_filter : boolean = true;

    public error_msg : string = '';
    public entity_status_msg : string = '';

    public show_dlg : boolean = false;
    public entity_relation: BaseEntity;
    
    public lookup_entity_name : string;
    public lookup_filter : BaseEntity;
    public lookup_rows : Array<BaseEntity> = [];
    public lookup_row_pages : Array<number> = [];
    public lookup_row_current_page : number = 0;

    public filter_loading : boolean= false;
    public lookup_loading : boolean= false;
    public isDetailsFilterCollapsed = true;

    public validations : KeyedCollection<ISelectObj>;

    public constructor(type : new() => T) {
        this.rows = [];
        this.filter = BaseEntity.createInstance<T>(type);
       
        
    }

   
     
}
