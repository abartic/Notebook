import { BaseEntity, eEntityStatus, IPropInfo } from '../../../../server/models/base-entity';


export class Package<T extends BaseEntity> {

    public selected_row: T;
    public rows : T[];
    public filter : T;
    public entity : T;
    public row_pages : Array<number> = [];
    public row_current_page : number = 0;
    public row_count : number = 0;
    public row_page_max : number = 1;
    public show_filter : boolean = true;
    public error_msg : string = '';
    public entity_status_msg : string = '';
    public show_dlg : boolean = false;
    

    public constructor(type : new() => T) {
        this.rows = [];
        this.filter = BaseEntity.createInstance<T>(type);
    }

   
     
}
