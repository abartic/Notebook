
import { BaseEntity, SheetInfo, LookupProp, IShellInfo } from "./base-entity";

@SheetInfo("system", "logs", "LogEntry")
export class LogEntry extends BaseEntity {

    public log_date: Date;

    public log_user: string;

    public log_descr: string;

}