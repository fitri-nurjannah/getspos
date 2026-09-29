import { Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubAccount } from '@root/src/app/interfaces/interfaces';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { ToastService } from '@core/services/toast.service';
import { SubAccountService } from '../sub-account.service';
import { LowerCasePipe } from '@angular/common';

// CDK Dialog Imports
import { DialogModule, DialogRef, Dialog } from '@angular/cdk/dialog';

// Angular Material & Icons
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { provideIcons } from '@ng-icons/core';
import { heroLockClosed, heroXMark } from '@ng-icons/heroicons/outline';

declare const $: any;

@Component({
    selector: 'app-sub-account-create-edit',
    templateUrl: './sub-account-create-edit.component.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatButtonToggleGroup,
        MatButtonToggle,
        MatSuffix,
        MatSelect,
        MatOption,
        LowerCasePipe,
        DialogModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [
        provideIcons({ heroLockClosed, heroXMark })
    ]
})
export class SubAccountCreateEditComponent implements OnInit, OnDestroy {
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate: TemplateRef<any>;
  private dialogRef: DialogRef;

  modalFor: 'create' | 'edit';
  subAccountId;
  subAccountForm: FormGroup;
  subAccount: SubAccount = {};
  subAccounts: SubAccount[] = [];
  separateLogin;
  userEmail;
  showForm = false;

  private _takeUntil: Subject<void> = new Subject();

  private toast = inject(ToastService);

  constructor(
    private dialog: Dialog,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _subAccountService: SubAccountService,
    private _authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.userEmail = this._authService.getUserDetails().email;
    
    // Get params from the route
    this.modalFor = this._activatedRoute.snapshot.params['modalFor'];
    this.subAccountId = this._activatedRoute.snapshot.params['id'];

    this._subAccountService.getSubAccounts$
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_subAccounts: SubAccount[]) => {
        if (_subAccounts.length) {
          this.subAccounts = _subAccounts;

          if (this.modalFor === 'edit') {
            this._subAccountService
              .setAndGetSubAccount(this.subAccountId)
              .pipe(takeUntil(this._takeUntil))
              .subscribe((_subAccount: SubAccount) => {
                this.subAccount = _subAccount;
                this.initForm();
                this.showForm = true;
              });
          } else {
            this.initForm();
            this.showForm = true;
          }
        }
      });

    // Open the dialog automatically when route component initializes
    setTimeout(() => {
      this.dialogRef = this.dialog.open(this.dialogTemplate, {
        disableClose: true,
        autoFocus: 'first-tabbable',
        restoreFocus: false,
      });

      this.dialogRef.closed.subscribe(() => {
        this._router.navigate(['../../'], { relativeTo: this._activatedRoute });
      });
    });
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  // Closes dialog and returns to list
  closeDialog(): void {
    this.dialogRef.close();
    this._router.navigate(['/sub-accounts']);
  }

  isSlaveSliderChanged(event): void {
    if (event.value) {
      this.subAccountForm.addControl(
        'masterId',
        new FormControl(null, Validators.required)
      );

      if (this.modalFor == 'edit') {
        // let masterId = ;

        // this.arrayOfSubAccounts.forEach((_sa) => {
        //   _sa?.slaveSubAccount?.forEach((_sas) => {
        //     if (_sa.id == this.focusedSubAccountId) {
        //       selectedSlaveSubAccountMasterId = _sas.masterId;
        //     }
        //   });
        // });
        this.subAccountForm.get('masterId').setValue(this.subAccount.masterId);
      }
    } else {
      this.subAccountForm.removeControl('masterId');
    }
  }
  
  separateLoginChanged(_event): void {
    this.separateLogin = _event.checked;

    if (this.separateLogin) {
      this.addSubAccountLoginFormControls();
    } else {
      this.subAccountForm.removeControl('username');
      this.subAccountForm.removeControl('password');
    }
  }

  generatePassword(): void {
    const password = this.getRandomPassword();
    this.subAccountForm.get('password').setValue(password);
  }

  submitForm(): void {
    if (this.subAccountForm.invalid) {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Please Fill Form Correctly!'
      });
      
      return;
    }
    if (this.modalFor === 'create') {
      this.createSubAccount();
    } else if (this.modalFor === 'edit') {
      this.editSubAccount();
    }
  }

  private initForm(): void {
    this.subAccountForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      isSlave: new FormControl(false),
    });

    if (this.modalFor == 'edit') {
      const objToBeSet: SubAccount = {
        name: this.subAccount.name,
        isSlave: this.subAccount.isSlave,
      };

      // if sub account is slave
      if (this.subAccount.isSlave) {
        this.subAccountForm.addControl(
          'masterId',
          new FormControl('', Validators.required)
        );
        objToBeSet.masterId = this.subAccount.masterId;
      }

      this.subAccountForm.setValue(objToBeSet);
      // if (!this.subAccount.credential) for details toogle
    }
    // show login details
    this.addSubAccountLoginFormControls();
  }

  private addSubAccountLoginFormControls(): void {
    this.separateLogin = true;
    this.subAccountForm.addControl(
      'username',
      new FormControl(
        null,
        Validators.compose([
          Validators.required,
          this.usernameWithoutSpaceValidator,
        ])
      )
    );
    this.subAccountForm.addControl(
      'password',
      new FormControl(
        null,
        this.modalFor == 'edit' && this.subAccount.credential
          ? Validators.minLength(8)
          : Validators.compose([Validators.required, Validators.minLength(8)])
      )
    );

    if (this.modalFor == 'edit') {
      let usernameWithUserEmail = this.subAccount.credential?.username;
      if (usernameWithUserEmail?.length) {
        this.subAccountForm
          .get('username')
          .setValue(
            usernameWithUserEmail.substr(
              0,
              usernameWithUserEmail.lastIndexOf('/')
            )
          );
      }
    }
  }

  private editSubAccount(): void {
    // checks whether new name is exist in other subaccounts or not
    const subAccountByName = this._subAccountService.getSubAccount(
      null,
      this.subAccountForm.value['name'].toUpperCase()
    );

    this._subAccountService.editSubAccount(this.subAccountForm.value).subscribe(
      () => {
        this.toast.add({
          key: 'top-center',
          severity: 'success',
          summary: 'Subaccount edited successfully!'
        });
        this.hideForm();
      },
      (error) => {
        this.createEditResError(error);
      }
    );
  }

  private createSubAccount(): void {
    // checks whether new name is exist in other subaccounts or not
    const subAccount = this._subAccountService.getSubAccount(
      null,
      this.subAccountForm.value.name
    );

    if (subAccount) {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Duplicate subaccount name! Please choose another one'
      });
      return;
    }

    this._subAccountService
      .createSubAccount(this.subAccountForm.value)
      .subscribe(
        () => {
          this.toast.add({
            key: 'top-center',
            severity: 'success',
            summary: 'Subaccount created successfully!'
          });
          this.hideForm();
        },
        (_error) => {
          this.createEditResError(_error);
        }
      );
  }

  private createEditResError(_error): void {
    if (_error && _error.error === 'duplicateEntry') {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Duplicate subaccount name! Please choose another one.'
      });
      this.subAccountForm.get('name').setErrors({
        notUnique: true,
      });
      this.subAccountForm.get('name').markAsTouched();
    } else if (_error && _error.error === 'limitExceeded') {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'You exceeded your sub accounts limit. Please upgrade your subscription or contact admin'
      });
    } else if (_error && _error.error === 'invalidPasswordForSubAccount') {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Invalid Password. Password Length Must Be At Least 8 Characters'
      });
    } else if (_error && _error.error === 'duplicateSubAccountUsername') {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Username Already Exists. Change Username and Try Again'
      });
    } else {
      this.toast.add({
        key: 'top-center',
        severity: 'error',
        summary: 'An error occurred.'
      });
    }

    console.error(_error);
  }

  private hideForm(): void {
    this.closeDialog();
  }

  private getRandomPassword(): string {
    const length = 24;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  private usernameWithoutSpaceValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    return control.value?.indexOf(' ') != -1
      ? { usernameWithSpace: { value: true } }
      : null;
  }
}
