


import { BaseEntity, SheetInfo, LookupProp, IPropInfo } from "./base-entity";
import { Partner } from './partner';
import { eTypeMovement } from '../common/enums';
import { ReceivableShell } from '../shells/receivable-shell';

@SheetInfo("movements", "documents", "Receivable", ReceivableShell.adjustShellInfo, "code_doc")
export class Receivable extends BaseEntity {

    public code_doc: string;

    @LookupProp("partner", ["code_part", "name_partner", "descr_partner"])
    public code_part: string;

    public currency: string;
    
    public type_doc: string;

    public creation_date: Date;

    public due_date: Date;

    public register_date: Date;

    public internal_reference: string;

// tslint:disable-next-line: quotemark
    @LookupProp("store", ["code_store", "descr_store"])
    public code_store: string;

    public has_movements: boolean;

    public has_payments: boolean;

    public debit_value: number;

    public credit_value: number;

    public notes: string;

    public partner_notes: string;

    public type_movement: string;

   

    public onNew(parent: BaseEntity) {
        super.onNew(parent);
        this.has_movements = true;
        this.has_payments = true;
        this.debit_value = 0;
        this.credit_value = 0;
        this.type_movement = eTypeMovement.Receivable;
    }

    public getReportType(): any {
// tslint:disable-next-line: curly
        if (this['partner_lookup_entity'] && (<Partner>this['partner_lookup_entity']).receivable_report_type)
            return (<Partner>this['partner_lookup_entity']).receivable_report_type;
// tslint:disable-next-line: curly
        else
            return this.entityName.toLocaleLowerCase();
    }

    private _props: Array<IPropInfo> = null;
    get properties(): Array<IPropInfo> {
        if (this._props === null) {
            this._props = this.entityInfo.properties;

            let index = this._props.findIndex(i => i.propName === 'code_doc');
            if (index >= 0) {
                let prop = this._props[index];
                prop.customInputType = 'num-pick-max';
            }

        }
        return this._props;
    }
}