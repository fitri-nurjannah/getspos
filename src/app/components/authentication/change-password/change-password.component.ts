import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../custom-validators';
import { animations } from '@root/src/app/animations';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { ToastService } from '@core/services/toast.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideIcons } from '@ng-icons/core';
import { heroLockClosed, heroKey, heroShieldCheck } from '@ng-icons/heroicons/outline';
import { UserDetails } from '@root/src/app/interfaces/interfaces';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css'],
    animations: animations,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        MatFormFieldModule,
        MatInputModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({
            heroLockClosed, heroKey, heroShieldCheck
        })]
})
export class ChangePasswordComponent implements OnInit {
  private toast = inject(ToastService);
  userDetails: UserDetails;
  changePasswordForm = this.createFormForChangePassword();
  constructor(
    private router: Router,
    private auth: AuthenticationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createFormForChangePassword();
    this.userDetails = this.auth.getUserDetails();
  }

  createFormForChangePassword() {
    return this.fb.group(
      {
        currentPassword: [null, Validators.required],
        password: [null, [Validators.required, Validators.minLength(8)]],
        confirmPassword: [null, Validators.required],
      },
      {
        // check whther our password and confirm password match
        validator: CustomValidators.passwordMatchValidator,
      }
    );
  }

  submitForm() {
    // changing password to new password
    this.changePasswordForm.value.newPassword = this.changePasswordForm.value.password;

    this.auth.changePassword(this.changePasswordForm.value).subscribe(
      (_data) => {
        this.toast.add({
          key: 'top-center',
          life: 1500,
          severity: 'success',
          summary:
            'Password Successfully Changed! Please Login again with new password.'
        });
        this.auth.logout();
        this.router.navigateByUrl('/login');
      },
      (_error) => {
        console.error(_error);
        // if current password entered is wrong
        if (_error && _error.error && _error.error.message == 'wrongPassword') {
          this.toast.add({
            key: 'top-center',
            severity: 'warn',
            summary: 'Wrong Current Password! Please enter correct one.',
          });
          return;
        }
      }
    );
  }
}
