import { eTypeMovement } from '../common/enums';

export class PaymentShell
{

    public static adjustShellInfo(shellInfo) {
        shellInfo.filter.static_filter = [{ key: 'type_movement', value: eTypeMovement.Payment }];
        shellInfo.report = {
            preloads: [
                {
                    entity_name: 'partner', ukey_prop_name: 'code_part', cb: (entity, lentity) => {
                        entity['partner_lookup_entity'] = lentity;
                    }
                }
            ]
        };

    }
}