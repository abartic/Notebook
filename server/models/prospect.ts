import { Address } from './address';
import { Contact } from './contact';
import { BaseEntity, SheetInfo, LookupProp, IShellInfo } from "./base-entity";

@SheetInfo("partners", "partners", "Prospect", "code_part") export
    class Prospect extends BaseEntity {



    public code_part: string;

    public name_partner: string;

    public descr_partner: string;

    public type_partner: string;

    public unit: string;

    public www_address: string;

    public email: string;

    public reg_number: string;

    public fiscal_reg_number: string;

    public name_admin: string;

    public name_rep: string;

    public IBAN: string;

    public IBAN_bank: string;

    public address_relation: (Address)[];

    public contact_relation: (Contact)[];

    public adjustShellInfo() {
        this.shellInfo.filter.static_filter = [{ key: 'type_partner', value: 'PRP' }];
        this.shellInfo.commands = this.shellInfo.commands.concat([
            { caption: 'New meeting', handler: 'onAddMeeting' },
            { caption: 'Calendar', handler: 'onShowCalendar' },
        ]);
    }

    public onNew(parent: BaseEntity) {
        super.onNew(parent);

        this.address_relation = [];
        this.contact_relation = [];
    }
}