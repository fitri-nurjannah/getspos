import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
  })
export class DateManipulation {
    constructor(public datepipe: DatePipe) {}

    public transformDate(normalDate: string): string  {
     return this.datepipe.transform(normalDate, 'yyyy-MM-dd');
    }
}
