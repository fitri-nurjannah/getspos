import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubAccount } from '@root/src/app/interfaces/interfaces';
import { ApiService } from '@root/src/app/services/api.service';
import { SubAccountApiService } from './sub-account-api.service';

import * as _ from 'lodash';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class SubAccountService {
  private _subAccounts: BehaviorSubject<SubAccount[]> = new BehaviorSubject([]);
  private _subAccount: BehaviorSubject<SubAccount> = new BehaviorSubject(null);

  get getSubAccounts$(): Observable<SubAccount[]> {
    return this._subAccounts.asObservable();
  }
  // get getSubAccount$(): Observable<SubAccount> {
  //   return this._subAccount.asObservable();
  // }

  constructor(private _subAccountApiService: SubAccountApiService) {}

  getSubAccountsFromDB(): void {
    this._subAccountApiService
      .getSubAccounts()
      .subscribe((_subAccounts: SubAccount[]) => {
        this.initSubAccountList(_subAccounts);
      });
  }

  // if id is null and name is provided, we will search by name
  getSubAccount(_id: number, _name?: string): SubAccount {
    let subAccount = this._subAccounts.value.find(
      (subAccount) => subAccount.id == _id || subAccount.name == _name
    );
    // if ssa not found, it means editing slave
    if (!subAccount) {
      this._subAccounts.value.forEach((_sa) => {
        _sa?.slaveSubAccount.forEach((_ssa) => {
          if (_ssa.id == _id || _ssa.name?.toUpperCase() == _name) {
            subAccount = _ssa;
          }
        });
      });
    }

    return subAccount;
  }

  setAndGetSubAccount(_id: number): Observable<SubAccount> {
    const subAccount = this.getSubAccount(_id);
    this._subAccount.next(subAccount);
    return this._subAccount.asObservable();
  }

  createSubAccount(_newSubAccount: SubAccount): Observable<SubAccount> {
    return this._subAccountApiService.createSubAccount(_newSubAccount).pipe(
      tap((_subAccountFromServer: SubAccount) => {
        const subAccountsArr = _.cloneDeep(this._subAccounts.value);
        // not slave
        if (!_subAccountFromServer.isSlave) {
          subAccountsArr.push(_subAccountFromServer);
        } else {
          subAccountsArr.forEach((_sa) => {
            // checking if subAccount is master for this one
            if (_sa.id == _subAccountFromServer.masterId) {
              _sa.slaveSubAccount.push(_subAccountFromServer);
            }
          });
        }
        this.initSubAccountList(subAccountsArr);
      })
    );
  }
  editSubAccount(_newSubAccount: SubAccount): Observable<SubAccount> {
    _newSubAccount.id = this._subAccount.value.id;
    return this._subAccountApiService.editSubAccount(_newSubAccount).pipe(
      tap((_subAccountFromServer: SubAccount) => {
        const subAccountsArr = _.cloneDeep(this._subAccounts.value);
        let subAccountIndex = subAccountsArr.findIndex(
          (subAccount) => subAccount.id == _subAccountFromServer.id
        );

        if (subAccountIndex == -1) {
          for (let i = 0; i < subAccountsArr.length; i++) {
            const _sa = subAccountsArr[i];

            _sa?.slaveSubAccount.forEach((_ssa, i) => {
              if (_ssa.id == _subAccountFromServer.id) {
                subAccountIndex = i;
              }
            });

            if (subAccountIndex != -1) {
              // if master is still same not updated
              if (_subAccountFromServer.masterId == _sa.id) {
                _sa.slaveSubAccount.splice(subAccountIndex, 1);
                _sa.slaveSubAccount.push(_subAccountFromServer);
              } else {
                _sa.slaveSubAccount.splice(subAccountIndex, 1); // removing from old sub account
                // if master is update and now this subaccount is attached another master sub account
                const masterSubAccount = subAccountsArr.find(
                  (_sa) => _sa.id == _subAccountFromServer.masterId
                );
                if (masterSubAccount) {
                  masterSubAccount.slaveSubAccount.push(_subAccountFromServer);
                }
              }
              break;
            }
          }
        } else {
          subAccountsArr.splice(subAccountIndex, 1);
          subAccountsArr.push(_subAccountFromServer);
        }

        debugger;

        this.initSubAccountList(subAccountsArr);
      })
    );
  }

  deleteSubAccount(): Observable<void> {
    const subAccount = this._subAccount.value;
    return this._subAccountApiService.deleteSubAccount(subAccount.id).pipe(
      tap(() => {
        const subAccounts = this._subAccounts.value;
        // not slave
        if (!subAccount.isSlave) {
          // because all master account is deleted, we will update slave as not not slave
          subAccount.slaveSubAccount.forEach((_ssa) => {
            _ssa.masterId = null;
            _ssa.isSlave = false;
            subAccounts.push(_ssa);
          });
          const subAccountIndex = subAccounts.findIndex(
            (_sa) => _sa.id == subAccount.id
          );

          if (subAccountIndex != -1) {
            subAccounts.splice(subAccountIndex, 1);
          }
        } else {
          let slaveSubAccountIndex = -1;
          for (let i = 0; i < subAccounts.length; i++) {
            const sa = subAccounts[i];

            for (let j = 0; j < sa.slaveSubAccount.length; j++) {
              const ssa = sa.slaveSubAccount[j];

              if (ssa.id == subAccount.id) {
                slaveSubAccountIndex = j;
              }
            }

            if (slaveSubAccountIndex != -1) {
              sa.slaveSubAccount.splice(slaveSubAccountIndex, 1);
              break;
            }
          }
        }

        this._subAccounts.next(subAccounts);
      })
    );
  }

  private initSubAccountList(_subAccounts: SubAccount[]): void {
    // making name lowercase
    _subAccounts.forEach((_sa) => (_sa.name = _sa.name?.toLowerCase()));
    let tempSubAccounts = _subAccounts.slice();

    tempSubAccounts = tempSubAccounts.filter((_tsa) => _tsa.name != 'master'); // taking master out
    tempSubAccounts = _.sortBy(tempSubAccounts, 'name');
    tempSubAccounts.forEach((_sa) => {
      _sa.slaveSubAccount?.forEach(
        (_ssa) => (_ssa.name = _ssa.name?.toLowerCase())
      );
      _sa.slaveSubAccount = _.sortBy(_sa.slaveSubAccount, 'name');
    });

    const master = _subAccounts.find((_sa) => _sa.name == 'master');
    tempSubAccounts.unshift(master); // adding master again in start
    this._subAccounts.next(tempSubAccounts);
  }
}
