export class ProspectShell
{
    public static adjustShellInfo(shellInfo) {
        shellInfo.filter.static_filter = [{ key: 'type_partner', value: 'PRP' }];
        shellInfo.commands = shellInfo.commands.concat([
            { caption: 'New meeting', handler: 'onAddMeeting' },
            { caption: 'Calendar', handler: 'onShowCalendar' },
        ]);
    }
}