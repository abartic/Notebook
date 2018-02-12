
import { BaseEntity } from "./base-entity";

export class Store extends BaseEntity {

    public code_store : String;

    public descr : String;

    public toArray() {
        return super.toArray().concat([this.code_store, this.descr]);
    }
}