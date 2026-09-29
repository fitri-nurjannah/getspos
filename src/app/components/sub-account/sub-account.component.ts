import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ApiService } from '@root/src/app/services/api.service';
import { SubAccount } from '@root/src/app/interfaces/interfaces';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { animations } from '@root/src/app/animations';

import * as _ from 'lodash';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { SubAccountService } from './sub-account.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgTemplateOutlet, NgClass, UpperCasePipe, TitleCasePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { solarQuestionCircleBold } from '@ng-icons/solar-icons/bold';
import { heroPlus, heroPencilSquare, heroTrash, heroEllipsisVertical } from '@ng-icons/heroicons/outline';
import { Dialog, DialogModule } from '@angular/cdk/dialog';

@Component({
    selector: 'app-sub-account',
    templateUrl: './sub-account.component.html',
    styleUrls: ['./sub-account.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIcon, RouterLink, NgTemplateOutlet,
        NgClass, MatMenuTrigger, MatMenu, MatMenuItem,
        RouterOutlet, UpperCasePipe, TitleCasePipe, DialogModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ solarQuestionCircleBold, heroPlus, heroPencilSquare, heroTrash, heroEllipsisVertical })]
})
export class SubAccountComponent implements OnInit, OnDestroy {
  arrayOfSubAccounts: SubAccount[] = [];

  isFormForCreate: boolean; // used to swith between create and update forms
  separateLogin: boolean = false;
  showModal: boolean = false;

  focusedSubAccountId = 0;
  modalFor: 'create' | 'edit'; // used to switch between create and edit form

  subAccountForm: FormGroup;

  userEmail = '';
  private _takeUntil: Subject<void> = new Subject();

  private toast = inject(ToastService);
  
  constructor(
    private _authService: AuthenticationService,
    private _subAccountService: SubAccountService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._subAccountService.getSubAccountsFromDB();
    this.userEmail = this._authService.getUserDetails().email;
    this._subscribeToSubAccountList();
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  openCreateEditModal(_modalFor: 'create' | 'edit'): void {
    this.modalFor = _modalFor;
  }

  // edit
  routeToEdit(_subAccountId: number): void {
    this._router.navigate(['edit', _subAccountId], {
      relativeTo: this._route,
    });
  }

  routeToDelete(_subAccountId: number): void {
    this._router.navigate(['delete', _subAccountId], {
      relativeTo: this._route,
    });
  }

  private _subscribeToSubAccountList(): void {
    this._subAccountService.getSubAccounts$
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_subAccounts: SubAccount[]) => {
        this.arrayOfSubAccounts = _subAccounts;
      });
  }
  private showNotification(
    isGenericError: boolean,
    _severity?: 'error' | 'success' | 'warn',
    _summary?: string
  ): void {

    if (isGenericError) {
      _severity = 'error';
      _summary = 'An error! Pleas refresh page or contact admin';
    }

    this.toast.add({
      key: 'top-center',
      severity: _severity,
      summary: _summary,
      closable: false,
    });
  }
}
