import { BaseEntity } from './../../../../server/models/base-entity';
import { Injectable } from "@angular/core";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";



@Injectable()
export class NgbDateFRParserFormatter extends NgbDateParserFormatter {
    parse(value: string): NgbDateStruct {
        return BaseEntity.parseDateStruct(value);
    }

    format(date: NgbDateStruct): string {
       
        return BaseEntity.toUserFormatDate(date);
    }
}