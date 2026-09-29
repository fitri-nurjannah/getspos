import { Injectable, ApplicationRef } from '@angular/core';
import { Subscription, BehaviorSubject, interval } from 'rxjs';
import { PlaylistStatusApiService } from './playlist-status-api.service';
import { AccountStatusHelpers } from '../helpers/accountStatusHelpers';

import moment from 'moment';
import * as _ from 'lodash';
import { SliderFile } from '@root/src/app/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PlaylistStatusDataService {
  oldTimeMinutes: number;

  timeInterval;

  private subAccountList;
  private _dashboardDataBehavior = new BehaviorSubject<any>({});
  // eslint-disable-next-line @typescript-eslint/member-ordering
  subAccountList$ = this._dashboardDataBehavior.asObservable(); // dashboard cannot be able to change the data

  constructor(
    private playlistStatusApiService: PlaylistStatusApiService,
    private applicationRef: ApplicationRef
  ) {}

  getNewData(): void {
    this.playlistStatusApiService.getPlaylistData().subscribe((_data) => {
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
    let subAccountList = _.cloneDeep(_data); // important because of reference type
    const socketData = _data.socketData;
    
    // setting statuses
    subAccountList.subAccounts.forEach(account => {
      account = AccountStatusHelpers.setStatuses(account, socketData);
    });
    this.updateDataBehaviour(subAccountList);
  }

  subscribeNewData(): any {
    this.getNewData();
    return this.subAccountList$;
  }

  // update after 5 seconds
  private updateDashboardData(_data): void {
    let isObjectSame = false; // can be true
    let subAccountList = _.cloneDeep(_data); // important because of reference type
    const socketData = _data.socketData;
    
    // setting statuses
    subAccountList.subAccounts.forEach(account => {
      account = AccountStatusHelpers.setStatuses(account, socketData);
    });

    if (this.subAccountList) {
      isObjectSame = _.isEqual(
        subAccountList,
        this.subAccountList
      );
    } else {
      isObjectSame = false;
    }

    // runs when objects are not same and adds new data
    //if (!isObjectSame) {
      this.updateDataBehaviour(subAccountList);
    //}
  }

  private updateDataBehaviour(_data): void {
    this.subAccountList = _data;
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
        //this.updateDashboardData(this.subAccountList);
        this.getNewData();
      }
    });
  }
  // Get from local variable array
  // private getDashboardDataArray(): any {
  //   return this.subAccountList;
  // }
}
