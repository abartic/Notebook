
export class BaseEntity {

    public rowID : Number;

    public uid : String;

    public toArray() : (String | Number | Date)[] {
        return [this.rowID, this.uid];
    }

}