import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../custom-validators';
import { animations } from '@root/src/app/animations';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { ToastService } from '@core/services/toast.service';
import { Router, RouterLink } from '@angular/router';
import { GenericService } from '@root/src/app/services/generic.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-forgot-password-change-password',
    templateUrl: './forgot-password-change-password.component.html',
    styleUrls: ['./forgot-password-change-password.component.css'],
    animations: animations,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        RouterLink
    ]
})
export class ForgotPasswordChangePasswordComponent implements OnInit {
  userEmail = GenericService.userEmailForNotLoggedInUser;
  changePasswordForm = this.createFormForChangePassword();
  private toast = inject(ToastService);
  constructor(
    private router: Router,
    private auth: AuthenticationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    if (!this.userEmail) {
      this.router.navigateByUrl('login');
      return;
    }
    this.createFormForChangePassword();
  }

  createFormForChangePassword() {
    return this.fb.group(
      {
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
    let objectToSend;
    // changing password to new password
    // this.changePasswordForm.value.newPassword = this.changePasswordForm.value.password;

    // this.changePasswordForm.value.isForForgotPassword = true;

    objectToSend = {
      userEmail: this.userEmail,
      password: this.changePasswordForm.value.password,
    };

    this.auth.changePasswordForForgotPassword(objectToSend).subscribe(
      (_data) => {
        this.toast.add({
          key: 'top-center',
          life: 1500,
          severity: 'success',
          summary: 'Password Successfully Changed! Please Login now.',
        });

        this.auth.logout();
        this.router.navigateByUrl('/login');
      },
      (_error) => {
        console.error(_error);

        // if current password entered is wrong
        if (
          _error &&
          _error.error &&
          _error.error.message == 'requestNotPermitted'
        ) {
          this.toast.add({
            key: 'top-center',
            severity: 'warn',
            summary:
              'Request not permitted! Please again go to "Forgot Password".',
          });

          this.router.navigateByUrl('/login');
          return;
        }
        this.toast.add({
          key: 'top-center',
          severity: 'error',
          summary: 'An error! Please refresh page and try again.',
        });
      }
    );
  }
}
