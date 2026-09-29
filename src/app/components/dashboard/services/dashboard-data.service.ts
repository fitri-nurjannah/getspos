import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { DashboardHelpers } from '../helpers/dashboardHelpers';

import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  oldTimeMinutes: number;

  timeInterval;

  private dashboardData;
  private _dashboardDataBehavior = new BehaviorSubject<any>({});
  // eslint-disable-next-line @typescript-eslint/member-ordering
  dashboardData$ = this._dashboardDataBehavior.asObservable(); // dashboard cannot be able to change the data

  constructor(
    private dashboardApiService: DashboardApiService,
    private applicationRef: ApplicationRef
  ) {}

  getNewData(): void {
    this.dashboardApiService.getDashboardData().subscribe((_data) => {
      this.updateDashboardDataForcefully(_data);
      if (!this.timeInterval) {
        this.startInterval();
      }

      // important to update the UI, when called from socket. below function works like .detectChanges()
      this.applicationRef.tick();
    });
  }

  // attaches interval for checking data every minute

  stopInterval(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }
  }

  // update forcefully
  updateDashboardDataForcefully(_data): void {
    let dashboardData = _.cloneDeep(_data); // important because of reference type
    // setting statuses
    dashboardData = DashboardHelpers.setStatuses(dashboardData);

    this.updateDataBehaviour(dashboardData);
  }

  dashboardDataSubscriberWithNewData(): any {
    this.getNewData();
    return this.dashboardData$;
  }

  // update after 5 seconds
  private updateDashboardData(_data): void {
    let isObjectSame = false; // can be true
    let dashboardData = _.cloneDeep(_data); // important because of reference type
    // setting statuses
    dashboardData = DashboardHelpers.setStatuses(dashboardData);

    if (this.dashboardData) {
      isObjectSame = _.isEqual(
        dashboardData.playlists,
        this.dashboardData.playlists
      );
    } else {
      isObjectSame = false;
    }

    // runs when objects are not same and adds new data
    if (!isObjectSame) {
      this.updateDataBehaviour(dashboardData);
    }
  }

  private updateDataBehaviour(_data): void {
    this.dashboardData = _data;
    this._dashboardDataBehavior.next([]);

    setTimeout(() => {
      this._dashboardDataBehavior.next(_data);
    }, 10);
  }

  private startInterval(): void {
    this.stopInterval();
    this.timeInterval = interval(5000).subscribe(() => {
      const secondsNow = new Date().getSeconds();

      if (secondsNow < 5) {
        this.updateDashboardData(this.dashboardData);
      }
    });
  }
}
