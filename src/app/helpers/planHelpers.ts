import { Plan } from '../interfaces/interfaces';
import * as _ from 'lodash';

export class PlanHelpers {
  constructor() {}

  /**
   * gets planArray and change object values to readable formate
   */
  public static changePlanArrayWithReadableValues(_planArray: Plan[]): Plan[] {

    _planArray = _planArray.map(_plan => {
      return PlanHelpers.changePlanWithReadableValues(_plan);
    });
    return _planArray;
  }

  /**
   * gets a plan and change it's attribute in readable form
   * @ e.g storageSpace: '10_mb' => storageSpace: '10MB'
   * @ e.g timePeriod: '10_m' => timePeriod: '10 Months'
   * @ e.g price: '10_rm' => storageSpace: '10 RM'
   */
  public static changePlanWithReadableValues(_plan: Plan): Plan {
    let newPlan = _.clone(_plan);

    newPlan.price = PlanHelpers.makePriceReadable(newPlan.price);
    newPlan.storageSpace = PlanHelpers.makeStorageSpaceReadable(newPlan.storageSpace);
    newPlan.timePeriod = PlanHelpers.makeTimePeriodReadable(newPlan.timePeriod);
    return newPlan;
  }


  /**
   * gets a value of storageSpace (e.g plan.storageSpace) and
   * returns readable format
   * @ e.g storageSpace: '10_mb' => storageSpace: '10MB'
   */
  public static makeStorageSpaceReadable(_storageSpace: string): string {
    if (_storageSpace) {
      const splittedString = _storageSpace.split('_');
      return splittedString[0] + splittedString[1].toUpperCase();
    }
  }


  /**
   * gets a value of time (e.g plan.time) and
   * returns readable format
   * @ e.g timePeriod: '10_m' => timePeriod: '10 Months'
   */
  public static makeTimePeriodReadable(_time): string {
    if (_time) {
      const splittedString = _time.split('_');

      // year
      if (splittedString[1].toUpperCase() == 'Y') {
        if (splittedString[0] == 1) return splittedString[0] + ' Year';
        else if(splittedString[0]) return splittedString[0] + 'Years';

        // day
      } else if (splittedString[1].toUpperCase() == 'D') {
        if (splittedString[0] == 1) return splittedString[0] + ' Day';
        else if(splittedString[0]) return splittedString[0] + 'Days';

        // month
      } else if (splittedString[1].toUpperCase() == 'M') {
        if (splittedString[0] == 1) return splittedString[0] + ' Month';
        else if(splittedString[0]) return splittedString[0] + 'Months';
      }

    }
  }


  /**
   * gets a value of price (e.g plan.price) and
   * returns readable format
   * @ e.g price: '10_rm' => price: '10 RM'
   */
  public static makePriceReadable(_price): string {
    if (_price) {
      const splittedString = _price.split('_');

      // year
      if (splittedString[1].toUpperCase() == 'RM') {
        return splittedString[0] + ' RM';
      }

    }
  }
}
