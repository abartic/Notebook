
export class BaseEntity<E> {

    public rowID: Number;

    public uid: String;

    protected getPropertiesMaps(): Array<[string, string]> { return undefined; }

    public toArray(): (String | Number | Date)[] {
        let array = [this.rowID, this.uid];

        if (this.getPropertiesMaps()) {
            for (let p of this.getPropertiesMaps()) {
                array.push(this[p["0"]])
            }
        }

        return array;
    }

    public clearFilter() {

        for (let p of this.getPropertiesMaps()) {
            if (this[p["0"]]) {
                this[p["0"]] = undefined;
            }
        }
    }

    public toFilter(offset: number, limit: number): string {

        let query = 'select ';
        for (let p of this.getPropertiesMaps()) {
            query = query + p["1"] + ',';
        }
        query = query.slice(0, query.length - 1);
        query = query + ' where '; 

        let where = ' 1=1 ';
        for (let p of this.getPropertiesMaps()) {
            if (this[p["0"]]) {
                let fvalue = (<string>this[p["0"]]).toUpperCase();
                if (fvalue.indexOf('%') >= 0)
                    where = where + ' and upper(' + p["1"] + ') like "' + fvalue + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0 && '=<>'.indexOf(fvalue[1]) >= 0)
                    where = where + ' and upper(' + p["1"] + ')' + fvalue.substring(0, 2) + '"' + fvalue.substring(2) + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0)
                    where = where + ' and upper(' + p["1"] + ')' + fvalue.substring(0, 1) + '"' + fvalue.substring(1) + '"';
                else
                    where = where + ' and upper(' + p["1"] + ') like "%' + fvalue + '%"';
            }
        }
        query = query + where;

        if (limit)
            query = query + ' limit ' + limit;
        if (offset)
            query = query + ' offset ' + offset;
        return query;
    }

    public toCountFilter(offset: number, limit: number): string {

        let query = 'select count(A) where 1=1 ';

        for (let p of this.getPropertiesMaps()) {
            if (this[p["0"]]) {
                let fvalue = (<string>this[p["0"]]).toUpperCase();
                if (fvalue.indexOf('%') >= 0)
                    query = query + ' and upper(' + p["1"] + ') like "' + fvalue + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0 && '=<>'.indexOf(fvalue[1]) >= 0)
                    query = query + ' and upper(' + p["1"] + ')' + fvalue.substring(0, 2) + '"' + fvalue.substring(2) + '"';
                else if ('=<>'.indexOf(fvalue[0]) >= 0)
                    query = query + ' and upper(' + p["1"] + ')' + fvalue.substring(0, 1) + '"' + fvalue.substring(1) + '"';
                else
                    query = query + ' and upper(' + p["1"] + ') like "%' + fvalue + '%"';
            }
        }

        if (limit)
            query = query + ' limit ' + limit;
        if (offset)
            query = query + ' offset ' + offset;
        return query;
    }
}