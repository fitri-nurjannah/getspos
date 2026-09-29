/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';

import { Dialog } from '@angular/cdk/dialog';
import { DropzoneFileUploadModalComponent } from '@root/src/app/components/dropzone-file-upload-modal/dropzone-file-upload-modal.component';

@Injectable({
  providedIn: 'root'
})

export class GenericService {
  private dialog = inject(Dialog);

  private static _userEmailForNotLoggedInUser;

  static get userEmailForNotLoggedInUser(): string {

    // if variables is null, we will get through token
    if (this._userEmailForNotLoggedInUser) { return this._userEmailForNotLoggedInUser; } else {
      this._userEmailForNotLoggedInUser = this.getToken();
      return this._userEmailForNotLoggedInUser;
    }
  }

  static set userEmailForNotLoggedInUser(value: string) {
    this.saveToken(value);
    this._userEmailForNotLoggedInUser = value;
  }

  fileUploadModalStatusSubject: Subject<any> = new Subject();

  constructor() {}

  displayUploadFileModal(_showModal: boolean, _link?, _userLimitInfos?): void {
    if (_showModal) {
      this.dialog.open(DropzoneFileUploadModalComponent, {
        data: {
          link: _link,
          userLimitInfos: _userLimitInfos
        },
        disableClose: false
      });
    }
  }

  changeFileUploadModalStatus(_status: 'completed' | 'started' | 'canceled'): void {
    if (_status) {
      this.fileUploadModalStatusSubject.next(_status);
    }
  }

  //////////////////////////////
  /////// Token functions //////
  //////////////////////////////

  public static saveToken(email): void {
    localStorage.setItem('getspos-email', email);
  }

  static getToken(): string {
    return localStorage.getItem('getspos-email');
  }
}
