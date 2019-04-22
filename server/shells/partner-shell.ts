export class PartnerShell
{
    public static adjustShellInfo(shellInfo) {
        shellInfo.filter.static_filter = [{ key: 'type_partner', value: '' }];
        shellInfo.filter.sortFields = ["code_part","name_part","descr_partner", "name_admin", "name_rep"];
        
    }
}