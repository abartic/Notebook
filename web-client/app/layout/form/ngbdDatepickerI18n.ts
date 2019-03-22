import { UserSession } from './../../common/userSession';
import { Injectable } from '@angular/core';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { UserSessionService } from '../../services/userSessionService';

const I18N_VALUES = {
    en: {
        weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    ro: {
        weekdays: ['Lu', 'Ma', 'Mi', 'Joi', 'Vi', 'Sa', 'Du'],
        months: ['Ian', 'Feb', 'Mar', 'Apr', 'Mar', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'],
    }
};


// Define custom service providing the months and weekdays translations
@Injectable({
    providedIn: 'root'
})
export class CustomDatepickerI18n extends NgbDatepickerI18n {
    
    userSession: UserSession;
    defaultLanguage = 'en';

    get Language()
    {
        return this.userSession ? this.userSession.Language : this.defaultLanguage;
    }

    constructor(private userSessionService: UserSessionService) {
        super();
        this.userSessionService.userSession.subscribe(
            us => { this.userSession = us },
            error => {});
    }

    getWeekdayShortName(weekday: number): string {
        return I18N_VALUES[this.Language].weekdays[weekday - 1];
    }
    getMonthShortName(month: number): string {
        return I18N_VALUES[this.Language].months[month - 1];
    }
    getMonthFullName(month: number): string {
        return this.getMonthShortName(month);
    }
    getDayAriaLabel(date: import("@ng-bootstrap/ng-bootstrap").NgbDateStruct): string {
        return "";
    }
}

