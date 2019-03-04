import { eTypeMovement } from '../common/enums';

export class InvoiceShell
{

    public static adjustShellInfo(shellInfo) {
        shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.StocksOutput }];
        shellInfo.filter.commands[2].isDisabled = false;
        shellInfo.commands = shellInfo.commands.concat([
            { caption: 'Print', handler: 'onPrint', image: 'fa fa-print' },
        ]);
       
        shellInfo.report = {
            preloads: [
                {
                    entity_name: 'partner', ukey_prop_name: 'code_part', cb: (entity, lentity) => {
                        entity['partner_lookup_entity'] = lentity;
                    }
                },

                {
                    entity_name: 'address', ukey_prop_name: 'code_part', cb: (entity, lentity) => {
                        entity['partner_address_lookup_entity'] = lentity;
                    }
                }
            ]
        };
    }
}