import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'momentTransformDate',
  pure: false,
  standalone: true
})
export class MomentTransformDatePipe implements PipeTransform {

  transform(value: moment.Moment, format: string = 'MMMM YYYY'): string {
    return value.format(format);
  }

}
