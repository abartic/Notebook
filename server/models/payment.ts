
import { BaseEntity, SheetInfo, LookupProp } from "./base-entity";
import { eTypeMovement } from '../common/enums';
import { PaymentShell } from '../shells/payment-shell';

@SheetInfo("movements", "documents", "Payment", PaymentShell.adjustShellInfo, "code_doc")
export class Payment extends BaseEntity {

    public code_doc: string;

    @LookupProp("partner", ["code_part", "name_partner", "descr_partner"])
    public code_part: string;

    public type_doc: string;

    public currency: string;
    
    public creation_date: Date;

    public due_date: Date;

    public register_date: Date;

    public internal_reference: string;

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
        this.type_movement = eTypeMovement.Payment;
    }
}