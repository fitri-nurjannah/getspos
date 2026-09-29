import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubAccount } from '@root/src/app/interfaces/interfaces';
import { ApiService } from '@root/src/app/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class SubAccountApiService {
  constructor(private _apiService: ApiService) {}

  ////////////////////
  /// Sub-Account  ///
  ////////////////////

  /**
   * getSubAccounts
   */
  public getSubAccounts(): Observable<any> {
    return this._apiService.request('get', 'sub-account/index');
  }

  // create subaccount
  public createSubAccount(_subAccount: SubAccount): Observable<any> {
    return this._apiService.request('post', 'sub-account/create', _subAccount);
  }

  // create subaccount
  public editSubAccount(_subAccount: SubAccount): Observable<any> {
    return this._apiService.request(
      'post',
      `sub-account/${_subAccount.id}/edit`,
      _subAccount
    );
  }

  // delete subaccount
  public deleteSubAccount(_subAccountId: number): Observable<any> {
    return this._apiService.request(
      'post',
      `sub-account/${_subAccountId}/delete`
    );
  }
}
