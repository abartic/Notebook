import { Partner } from './../../../../server/models/partner';


export class Package {

    public rows : string[][];
    public filter : Partner;
    public row_pages : Array<number> = [];
    public row_current_page : number = 0;
    public row_count : number;
    public row_page_max : number = 1;

    public 
    constructor() {
        this.rows = [];
        this.filter = new Partner();
    }

}
