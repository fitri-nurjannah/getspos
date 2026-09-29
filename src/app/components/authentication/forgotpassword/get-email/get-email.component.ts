import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { ToastService } from '@core/services/toast.service';
import { Router, RouterLink } from '@angular/router';
import { BaseHelpers } from '@root/src/app/helpers/baseHelpers';
import { GenericService } from '@root/src/app/services/generic.service';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-get-email',
    templateUrl: './get-email.component.html',
    styleUrls: ['./get-email.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RouterLink,
        FormsModule
    ]
})
export class GetEmailComponent implements OnInit {
  email: string;
  submitting = false;
  private toast = inject(ToastService);
  constructor(
    private router: Router,
    private auth: AuthenticationService,
  ) {}

  ngOnInit() {}

  submit() {
    let objectToSend;
    if (!this.auth.isEmailInputValid(this.email)) {
      // adding invalid class to email input
      document.getElementById('emailInput').classList.add('is-invalid');

      this.toast.add({
        key: 'top-center',
        severity: 'error',
        summary: 'Please enter a valid email!'
      });
      return;
    }

    this.submitting = true;
    objectToSend = {
      email: this.email,
      tokenFor: BaseHelpers.getVerificationCodeType().forgotPassword,
    };

    // saving email for using in the verification page
    GenericService.userEmailForNotLoggedInUser = this.email;

    this.auth.sendVerificationCodeEmail(objectToSend).subscribe(
      (_data) => {
        this.toast.add({
          key: 'top-center',
          life: 1500,
          severity: 'success',
          summary: 'Email sent! Please check your email.',
        });
        this.router.navigateByUrl(
          '/verify-token/' +
            BaseHelpers.getVerificationCodeType().forgotPassword
        );

        this.submitting = false;
      },
      (_error) => {
        this.submitting = false;
        console.error(_error);

        if (_error && _error.error && _error.error.message == 'userNotExist') {
          this.toast.add({
            key: 'top-center',
            severity: 'warn',
            summary: 'Email not found! Sign up instead.',
          });
        } else {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary:
              'An error occured! Please check internet or try again after refreshing page.',
          });
        }
      }
    );
  }
}
