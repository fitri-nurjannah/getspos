import { afterNextRender, Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BaseHelpers } from '@root/src/app/helpers/baseHelpers';
import { GenericService } from '@root/src/app/services/generic.service';
import { UserLimitsInfoService } from '../../shared/user-limits-table/user-limits-info.service';
import { SliderHelpers } from '@root/src/app/components/dashboard/helpers/sliderHelpers';
import { NgIcon } from '@ng-icons/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        NgIcon
    ]
})
export class LoginComponent implements OnInit {
  // Creating Login form input elements
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    stage: new FormControl(),
    subAccount: new FormControl(),

  });
  formSubmitting = false;
  isFirstStepCleared = false;

  subAccountsOptionsArray = [];
  subAccountsSelectedArray: any;
  private toast = inject(ToastService);

  constructor(
    private _userLimitInfoService: UserLimitsInfoService,
    private ngxLoaderService: NgxUiLoaderService,
    private auth: AuthenticationService,
    private router: Router,
  ) {
    afterNextRender(() => {
      this.ngxLoaderService.stop(); 
    });
  }

  ngOnInit(): void {
    this.ngxLoaderService.start();

    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  login(_stage: '1' | '2', _subAccount: string): void {
    if (!this.auth.isEmailInputValid(this.loginForm.value.email)) {
      // adding invalid class to email input
      document.getElementById('emailInput').classList.add('is-invalid');
      this.toast.add({
        key: 'top-center',
        severity: 'error',
        summary: 'Please enter a valid email!',
        closable: false,
      });
      return;
    }

    // changing email address to upper case
    this.loginForm.value.email = this.loginForm.value.email.toLowerCase();

    this.formSubmitting = true;

    const loginData = this.loginForm.value;
    loginData.stage = _stage;

    if (_stage === '2') {
      loginData.subAccount = _subAccount;
    }
    this.auth.login(loginData).subscribe({
      next: (_data: any) => {
        

        if (
          _stage == '1' &&
          _data.message &&
          _data.message.toUpperCase() == 'nextStageRequired'.toUpperCase()
        ) {
          this.isFirstStepCleared = true;
          this.formSubmitting = false;

          this.initDropdowns(_data.subAccounts);
          return;
        }

        // updating limit infos when user login again
        //this._userLimitInfoService.updateUserLimitInfos();
        if (_data) {
          if (_data.isAdmin == true) {
            if (this.auth.getUserDetails().subAccount != 'master') {
              SliderHelpers.openFullscreen(document.documentElement);
              this.router.navigateByUrl('/dashboard');
            } else {
              sessionStorage.setItem('fromLogin', 'true');
              location.href = '/dashboard';
            }
            // if user is admin
            this.toast.add({
              key: 'bottom-right',
              life: 1500,
              severity: 'success',
              summary: 'Login Success',
            });
            return;
          }

          if (_data.isEmailVerified == false) {
            // if email is not verified
            this.toast.add({
              key: 'top-center',
              sticky: false,
              life: 3000,
              severity: 'warn',
              summary: 'Please verify your email to login!',
            });

            GenericService.userEmailForNotLoggedInUser =
              this.loginForm.value.email;
              this.router.navigateByUrl(
                'verify-token/' + BaseHelpers.getVerificationCodeType().signup
              );
              return;
          } else if (_data.isActive == false) {
            // if account is not active
            this.toast.add({
              key: 'top-center',
              sticky: true,
              severity: 'warn',
              summary: 'Your account is not active! Please contact with Admin.',
            });
            this.formSubmitting = false;
          } else if (
            _data.isAdminProvidedPrice == false &&
            BaseHelpers.checkPlanName(_data.userType).isEnterprise
          ) {
            // if user is enterprise and admin haven't provided a price for him
            this.router.navigateByUrl('message/waitForAdminResponse'); // we will show a message for qoute from the admin
            return;
          } else if (
            _data.isAmountPaid == false &&
            !BaseHelpers.checkPlanName(_data.userType).isFreemium
          ) {
            // if amount is not paid and user is not freemium
            // for getting user email in checkout page
            GenericService.userEmailForNotLoggedInUser = loginData.email;
            this.router.navigateByUrl('/checkout');
            return;
          } else if (this.auth.getUserDetails().subAccount != 'master') {
            this._userLimitInfoService.updateUserLimitInfos();
            SliderHelpers.openFullscreen(document.documentElement);
            this.router.navigateByUrl('/dashboard');
          } else {
            // if all things are right, have to take user to the dashboard
            this._userLimitInfoService.updateUserLimitInfos();
            this.toast.add({
              key: 'bottom-right',
              life: 1500,
              severity: 'success',
              summary: 'Login Success',
            });
            this.router.navigateByUrl('/dashboard');
          }
        }
      },

      error: (err) => {
        console.error(err);
        // raze error message for different error types.
        if (err.status == 401) {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'Invalid email or password.',
            closable: false,
          });
        } else {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'Unable to connect. Check your internet.',
            closable: false,
          });
        }

        this.formSubmitting = false;
      }
    });
  }

  submitForm(): void {
    this.login('1', null);
  }

  initDropdowns(_subAccountsArray): void {
    let subAccountsArray = [..._subAccountsArray];
    subAccountsArray.forEach(
      (_s) => (_s.name = _s.name[0].toUpperCase() + _s.name.slice(1))
    ); // making first letter capital
    subAccountsArray.unshift({ name: 'Choose' });
    this.subAccountsOptionsArray = subAccountsArray;
  }
  proceedSecondStage(): void {
    // not runs when 'Choose' is selected
    if (this.subAccountsSelectedArray) {
      this.login('2', this.subAccountsSelectedArray.name);
    }
  }
  disableForm(): boolean {
    return !this.loginForm.valid || this.formSubmitting;
  }

  goToSignup(): void {
    window.location.href = '/#packages';
  }
}
