import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BaseServicesService } from '../services/base-services.service';
import {
  UserDetails,
  TokenPayload,
  TokenResponse,
} from '../interfaces/interfaces';
import { BaseHelpers } from '../helpers/baseHelpers';
import { ApiService } from './api.service';
import { ToastService } from '@core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private token: string;
  private path: string;

  private toast = inject(ToastService);
  constructor(
    private base: BaseServicesService,
    private http: HttpClient,
    private router: Router
  ) {
    this.path = this.base.getPath();
  }

  public saveToken(token: string): void {
    localStorage.setItem('getspos-token', token);
    this.token = token;
  }

  getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('getspos-token');
    }

    return this.token;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('getspos-token');

    this.router.navigateByUrl('/login');
  }

  public getUserDetails(_token?): UserDetails {
    if (!_token) {
      _token = this.getToken();
    }
    let payload;

    if (_token) {
      payload = _token.split('.')[1];
      payload = window.atob(payload);

      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  // checks whether a user logged in with master account
  isMaster(): boolean {
    const user = this.getUserDetails(null);
    return user.subAccount.toUpperCase() == 'MASTER';
  }

  private request(
    method: 'post' | 'get',
    type:
      | 'login'
      | 'logout'
      | 'register'
      | 'profile'
      | 'forgotPassword'
      | 'edit-is-first-time-loggedin'
      | 'send-verification-code'
      | 'verify-token'
      | 'change-password'
      | 'change-password-for-forgot-password',
    user?: TokenPayload
  ): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(this.path + '/api/' + type, user, {
        headers: { Authorization: 'Bearer ' + this.getToken() },
      });
    } else {
      base = this.http.get(this.path + '/api/' + type, {
        headers: { Authorization: 'Bearer ' + this.getToken() },
      });
    }

    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          const userReceived = this.getUserDetails(data.token);

          // if user is admin or fullfils other requirements
          if (
            userReceived &&
            (userReceived.isAdmin ||
              (userReceived.isEmailVerified &&
                userReceived.isActive &&
                (BaseHelpers.checkPlanName(userReceived.userType).isFreemium ||
                  userReceived.isAmountPaid)))
          ) {
            this.saveToken(data.token);
          }

          // if user is not active, will not create a token

          return userReceived;
        }

        return data;
      }),
      catchError((err) => {
        if (
          err &&
          err.error &&
          (err.error.message == 'tokenExpired' ||
            err.error.message == 'subscriptionExpired')
        ) {
          this.logout();
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
        console.error('===> Error from authentication.service.ts: ', err);
        return throwError(err);
      })
    );

    return request;
  }

  // private handleError<T>(operation = 'operation', result?: T) {
  //   return (error: any): Observable<T> => {
  //     console.error('handleError() >>>. Operation: ' + operation + ' failed due to error: ' + result);
  //     return of(result as T);
  //   };
  // }
  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'register', user);
  }

  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }

  public logoutFromServer(): Observable<any> {
    return this.request('post', 'logout');
  }

  public profile(): Observable<any> {
    return this.request('get', 'profile');
  }

  public forgotPassword(_user: TokenPayload): Observable<any> {
    return this.request('post', 'forgotPassword', _user);
  }

  // checks email validations
  public isEmailInputValid(_email: String): Boolean {
    // tslint:disable-next-line:max-line-length
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(_email).toLowerCase());
  }

  public editFirstTimeLoggedIn() {
    return this.request('post', 'edit-is-first-time-loggedin');
  }

  // send verfication code email
  public sendVerificationCodeEmail(_objectToSend) {
    return this.request('post', 'send-verification-code', _objectToSend);
  }

  // verify-token code
  public verifytoken(_objectToSend) {
    return this.request('post', 'verify-token', _objectToSend);
  }

  // change Password
  public changePassword(_passwordObject): Observable<any> {
    return this.request('post', 'change-password', _passwordObject);
  }

  // change Password
  public changePasswordForForgotPassword(_passwordObject): Observable<any> {
    return this.request(
      'post',
      'change-password-for-forgot-password',
      _passwordObject
    );
  }
}
