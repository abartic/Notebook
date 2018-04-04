import { IPropInfo } from './../../../server/models/base-entity';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'property-visibility'})
export class ExponentialStrengthPipe implements PipeTransform {
  transform(property: IPropInfo, fkey_prop_name? : string): boolean {
    if (property.propName === 'uid' || property.propName === 'rowid'|| property.propName === fkey_prop_name) {
        return false;
    }
    else {
        return true;
    } 
  }
}