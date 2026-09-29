import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BaseServicesService } from './base-services.service';
import { AuthenticationService } from './authentication.service';
import { SubAccount } from '../interfaces/interfaces';

import { ToastService } from '@core/services/toast.service';
import { environment } from '@root/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private dashboardData;

  private path: string;

  getToken: string;

  private toast = inject(ToastService);

  constructor(
    private router: Router,
    private auth: AuthenticationService,
    private base: BaseServicesService,
    private http: HttpClient
  ) {
    this.path = this.base.getPath();
  }

  request(
    method: 'post' | 'get' | 'delete' | 'put',
    type: string,
    _objectToSend?: any
  ): Observable<any> {
    let base;
    this.getToken = this.auth.getToken();
    
    const header = {
      headers: { Authorization: 'Bearer ' + this.getToken },
    };
    if (method === 'post') {
      base = this.http.post(this.path + '/api/' + type, _objectToSend, header);
    } else if (method === 'get') {
      base = this.http.get(this.path + '/api/' + type, header);
    } else if (method === 'delete') {
      base = this.http.delete(this.path + '/api/' + type, header);
    } else if (method === 'put') {
      base = this.http.put(this.path + '/api/' + type, _objectToSend, header);
    }

    const request = base.pipe(
      map((data: any) => {
        if (!environment.production) {
          console.log(
            '%capi.service %csuccess',
            'color: black; background: yellow; padding: 2px; border-radius: 2px;',
            'color: white; background: blue; padding: 2px; border-radius: 2px;',
            data
          );
        }

        // if (data.token) {
        //   const userReceived = this.getUserDetails(data.token);

        //   // if user is not active, will not create a token
        //   if (userReceived && userReceived.isEmailVerified) {
        //     this.saveToken(data.token);
        //   }
        //   return userReceived;
        // }

        return data;
      }),
      catchError((err) => {
        if (
          err &&
          err.error &&
          (err.error.message == 'tokenExpired' ||
            err.error.message == 'subscriptionExpired')
        ) {
          this.auth.logout();
          if (err.error.message == 'tokenExpired') {
            this.toast.add({
              key: 'top-center',
              severity: 'warn',
              summary: 'Token Expired. Please login again'
            });
          } else if (err.error.message == 'subscriptionExpired') {
            this.router.navigateByUrl('message/subscriptionExpired'); // we will show a message for qoute from the admin
          }
        }
        if (!environment.production) {
          console.log(
            '%capi.service %cError',
            'color: black; background: yellow; padding: 2px; border-radius: 2px;',
            'color: white; background: red; padding: 2px; border-radius: 2px;',
            err
          );
        }
        return throwError(err);
      })
    );

    return request;
  }
  
  public getAllPlans(): Observable<any> {
    return this.request('get', 'plan/index');
  }

  ////////////////////////
  //////   Users   ///////
  ////////////////////////

  // gets all users or create them
  public getAllUsersOrCreateUser(
    _callType: 'get' | 'post',
    _userObject?
  ): Observable<any> {
    return this.request(_callType, 'user', _userObject);
  }

  // used for update and delete
  public editDeleteUser(
    _callType: 'delete' | 'put',
    _userId: number,
    _userObject?
  ): Observable<any> {
    return this.request(_callType, 'user/' + _userId, _userObject);
  }

  ////////////////////////////
  //////   checkout   ////////
  ////////////////////////////

  // used for update and delete
  public checkout(_userObject): Observable<any> {
    return this.request('post', 'checkout/get-checkout-details', _userObject);
  }
}
