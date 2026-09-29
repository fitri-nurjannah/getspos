import { Component, OnInit, Output, EventEmitter, TemplateRef, ViewChild, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '@root/src/app/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { User } from '@root/src/app/interfaces/interfaces';

// CDK & Material
import { Dialog, DialogRef, DialogModule } from '@angular/cdk/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Icons
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroUser, heroEnvelope, heroKey, heroPhone, heroMapPin, heroCalendar, heroComputerDesktop, heroXMark, heroUserPlus, heroShieldCheck } from '@ng-icons/heroicons/outline';
@Component({
    selector: 'app-create-edit-users',
    templateUrl: './create-edit-users.component.html',
    imports: [
        FormsModule, ReactiveFormsModule, DialogModule,
        MatFormFieldModule, MatInputModule, MatCheckboxModule,
        MatDatepickerModule, MatNativeDateModule, NgIconComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [
        provideIcons({ heroUser, heroEnvelope, heroKey, heroPhone, heroMapPin, heroCalendar, heroComputerDesktop, heroXMark, heroUserPlus, heroShieldCheck })
    ]
})
export class CreateEditUsersComponent implements OnInit, OnDestroy {
  @ViewChild('userDialogTemplate') userDialogTemplate: TemplateRef<any>;
  @Output() updateUsersList = new EventEmitter<boolean>();

  userForm: FormGroup;
  modalFor: 'create' | 'edit';
  formSubmitting = false;
  focusedUserId = 0;
  private dialogRef: DialogRef;
  private subscription: Subscription = new Subscription();

  private toast = inject(ToastService);

  constructor(
    private _apiService: ApiService,
    private _dialog: Dialog
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openModal(_modalFor: 'create' | 'edit', _selectedUser?: User): void {
    this.initUserForm(_modalFor, _selectedUser);
    
    this.dialogRef = this._dialog.open(this.userDialogTemplate, {});
  }

  closeDialog(): void {
    if (this.dialogRef) this.dialogRef.close();
    this.formSubmitting = false;
  }

  initUserForm(_modalFor: 'create' | 'edit', _selectedUser?: User): void {
    this.modalFor = _modalFor;
    const isEdit = _modalFor === 'edit';

    if (isEdit) this.focusedUserId = _selectedUser.id;

    this.userForm = new FormGroup({
      name: new FormControl(isEdit ? _selectedUser.name : null, Validators.required),
      email: new FormControl(isEdit ? _selectedUser.email : null, [Validators.email, Validators.required]),
      password: new FormControl(null, isEdit ? [Validators.minLength(8)] : [Validators.minLength(8), Validators.required]),
      phoneNo: new FormControl(isEdit ? _selectedUser.phoneNo : null),
      address: new FormControl(isEdit ? _selectedUser.address : null),
      isActive: new FormControl(isEdit ? _selectedUser.isActive : true),
      isAdmin: new FormControl(isEdit ? _selectedUser.isAdmin : false),
      isEmailVerified: new FormControl(isEdit ? _selectedUser.isEmailVerified : false),
      subscriptionExpDate: new FormControl(isEdit ? _selectedUser.subscribedPlan?.endDate : null),
      customStorageSpace: new FormControl(isEdit ? _selectedUser.subscribedPlan?.plan?.storageSpace : 500, Validators.required),
      customLocations: new FormControl(isEdit ? _selectedUser.subscribedPlan?.plan?.numberOfDisplays : 1, Validators.required),
    });
  }

  submitUserForm(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Please fill the form correctly',
      });
      
      return;
    }
    this.modalFor === 'create' ? this.createUser() : this.editUser();
  }

  createUser(): void {
    this.formSubmitting = true;
    this.subscription.add(
      this._apiService.getAllUsersOrCreateUser('post', this.userForm.value).subscribe({
        next: (res: any) => {
          this.updateUsersList.emit(true);
  
          if (res && res.emailSent === false) {
            this.toast.add({
              key: 'top-center',
              severity: 'warn',
              summary: 'User Created, but the verification email failed to send.',
            });
          } else {
            this.toast.add({
              key: 'top-center',
              severity: 'success',
              summary: 'User Created Successfully!',
            });
          }
          this.closeDialog();
        },
        error: (err) => {
          this.formSubmitting = false;
          this.handleError(err);
        }
      })
    );
  }

  editUser(): void {
    this.formSubmitting = true;
    this.subscription.add(
      this._apiService.editDeleteUser('put', this.focusedUserId, this.userForm.value).subscribe({
        next: () => {
          this.updateUsersList.emit(true);
          this.toast.add({
            key: 'top-center',
            severity: 'success',
            summary: 'User Edited Successfully!',
          });
          this.closeDialog();
        },
        error: (err) => {
          this.formSubmitting = false;
          this.handleError(err);
        }
      })
    );
  }

  private handleError(err: any): void {
    if (err.error?.name === 'SequelizeUniqueConstraintError') {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'Duplicate email found!',
      });
    } else {
      this.toast.add({
        key: 'top-center',
        severity: 'error',
        summary: 'An error occurred while processing your request.',
      });
    }
  }

  setRandomPassword(): void {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@%_&*^$';
    let retVal = '';
    for (let i = 0; i < 16; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    this.userForm.get('password').setValue(retVal);
  }
}