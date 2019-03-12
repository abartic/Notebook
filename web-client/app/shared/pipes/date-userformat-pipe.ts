import { BaseEntity } from '../../../../server/models/base-entity';
import { Pipe, PipeTransform } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Pipe({ name: 'datefrm' })
export class DateUserFormatPipe implements PipeTransform {
    transform(date : NgbDateStruct) {
        return BaseEntity.toUserFormatDate(date);
    }
  }

