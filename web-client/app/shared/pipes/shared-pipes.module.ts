import { BaseEntity } from './../../../../server/models/base-entity';
import { Pipe, PipeTransform } from '@angular/core';



import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';





@Pipe({ name: 'datefrm' })
export class DateUserFormatPipe implements PipeTransform {
    transform(date : NgbDateStruct) {
        return BaseEntity.toUserFormatDate(date);
    }
  }


  @NgModule({
    imports: [
        CommonModule
    ],
    declarations: [DateUserFormatPipe],
    exports: [DateUserFormatPipe]
})
export class SharedModule { }