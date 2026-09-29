import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '@root/src/app/services/api.service';
import { UserLimitsInfo } from './user-limits-info.types';

@Injectable({
  providedIn: 'root',
})
export class UserLimitsInfoService {
  private $userLimitInfos: BehaviorSubject<UserLimitsInfo> = new BehaviorSubject<UserLimitsInfo>(
    null
  );

  private isFirstTimeChecked = false;
  /**
   * getter
   */
  public get getUserLimitInfos(): Observable<UserLimitsInfo> {
    if (!this.$userLimitInfos.value && !this.isFirstTimeChecked) {
      this.isFirstTimeChecked = true;
      this.updateUserLimitInfos();
    }
    return this.$userLimitInfos.asObservable();
  }
  constructor(private _apiService: ApiService) {}

  // gets the limits
  updateUserLimitInfos(): void {
    this._apiService
      .request('get', 'get-user-limit-infos')
      .subscribe((_userLimits: UserLimitsInfo) => {
        this.$userLimitInfos.next(_userLimits);
      });
  }
}
