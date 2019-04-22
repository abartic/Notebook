import { eTypeMovement } from '../common/enums';

export class PurchaseShell
{
    public static adjustShellInfo(shellInfo) {
        shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.StocksInput }];
        shellInfo.filter.sortFields = ["code_doc","code_part","creation_date", 'due_date', "type_doc", "code_store", "currency"];
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