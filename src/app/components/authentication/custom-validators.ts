import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import moment from 'moment';

export class CustomValidators {
  static patternValidator(regex: any, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }
      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
      // return null;
    };
  }

  static passwordMatchValidator(control: AbstractControl): void {
    const password: string = control.get('password').value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword').setErrors({ NoPassswordMatch: true });
    }
  }

  static scheduledTimeValidator(control: AbstractControl): ValidationErrors | null {
    const arrayOfScheduledTimes = control.value; // 'control' is the FormArray here
    if (!arrayOfScheduledTimes || arrayOfScheduledTimes.length < 2) return null;
  
    let hasOverlap = false;
  
    for (let i = 0; i < arrayOfScheduledTimes.length; i++) {
      for (let j = 0; j < arrayOfScheduledTimes.length; j++) {
        if (i === j) continue; // Don't compare a row to itself
  
        const start1 = moment(arrayOfScheduledTimes[i].startTime, 'HH:mm');
        const end1 = moment(arrayOfScheduledTimes[i].endTime, 'HH:mm');
        const start2 = moment(arrayOfScheduledTimes[j].startTime, 'HH:mm');
        const end2 = moment(arrayOfScheduledTimes[j].endTime, 'HH:mm');
  
        // Basic Overlap Logic: (StartA < EndB) and (EndA > StartB)
        if (start1.isValid() && end1.isValid() && start2.isValid() && end2.isValid()) {
          if (start1.isBefore(end2) && end1.isAfter(start2)) {
            hasOverlap = true;
            break;
          }
        }
      }
      if (hasOverlap) break;
    }
  
    return hasOverlap ? { wrongTimes: true } : null;
  }

  // for validation in form validator
  static isEndDateGreater(control: AbstractControl): void {
    const startDate: string = control.get('startDate').value; // get password from our password form control
    const endDate: string = control.get('endDate').value; // get password from our confirmPassword form control

    const isStartDateSmaller = moment(startDate).isSameOrBefore(endDate);

    if (!isStartDateSmaller) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('endDate').setErrors({ SmallerThanStartDate: true });
    }
  }
}
