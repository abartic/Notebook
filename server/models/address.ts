
import { BaseEntity, SheetInfo } from "./base-entity";
import { ModelInfos } from './modelProperties';

@SheetInfo("partners", "addresses","Address")  
export class Address extends BaseEntity {

   

    public code_part : string;

    public line_address : string;
    
    public city : string;
    
    public county : string;

    public country : string;

    public zip : string;

    public email : string;
}