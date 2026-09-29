import { afterNextRender, Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';
import { CustomValidators } from '../../../components/authentication/custom-validators';
import { animations } from '@root/src/app/animations';
import { AuthenticationService } from '../../../services/authentication.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@root/src/app/services/api.service';
import { GenericService } from '@root/src/app/services/generic.service';
import { BaseHelpers } from '@root/src/app/helpers/baseHelpers';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    animations: [animations],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        RouterLink
    ]
})
export class SignupComponent implements OnInit {
  formSubmitting = false;
  public frmSignup: FormGroup;

  isFirstTimeName = true;
  isFirstTimePassword = true;
  isFirstTimeEmail = true;
  isFirstTimePasswordMatch = true;

  isPaymentFormRequired = false; // used to show payment method information
  isEnterpriseRequested = false; // used to show enterprise form
  selectedPlan = '';
  selectedPlanId = '0';
  private toast = inject(ToastService);
  // Creating Login form input elements
  // signUpForm = new FormGroup({
  //   name: new FormControl('', [Validators.required]),
  //   email: new FormControl('', [Validators.required, Validators.email]),
  //   password: new FormControl('', [Validators.required, Validators.minLength(8)])
  // });

  // formSubmitting: Boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private readonly activatedRoute: ActivatedRoute,
    private ngxLoaderService: NgxUiLoaderService,
    private fb: FormBuilder,
    private auth: AuthenticationService
  ) {
    afterNextRender(() => {
      this.ngxLoaderService.stop();
    });
  }

  ngOnInit() {
    // 1. Start the loader immediately
    this.ngxLoaderService.start();

    // 2. Run your initialization logic
    this.getReqeustedPlan();

    // 3. Initialize the form
    this.frmSignup = this.createSignupForm();
  }

  getReqeustedPlan() {
    this.selectedPlan = this.activatedRoute.snapshot.paramMap
      .get('selectedPlan')
      .toUpperCase();
    this.selectedPlanId = this.activatedRoute.snapshot.paramMap.get('planId');
    // this.initFormEvaluationVariables(this.selectedPlan);
  }

  // inits isPaymentFormRequired && isEnterpriseRequested
  // initFormEvaluationVariables(_selectedPlan) {
  //   if (_selectedPlan === 'ENTERPRISE') {
  //     this.isEnterpriseRequested = true;
  //   }

  //   // if (_selectedPlan == 'freemium') {
  //   //   this.isPaymentFormRequired = false;
  //   // } else if (_selectedPlan == 'enterprise') {
  //   //   this.isPaymentFormRequired = true;
  //   //   this.isEnterpriseRequested = true;
  //   // } else if (_selectedPlan == 'Location') {
  //   //   this.isPaymentFormRequired = true;
  //   // }
  // }

  createSignupForm(): FormGroup {
    let formElementsObject;
    // this.frmSignup.controls['asdf'].invalid
    formElementsObject = {
      name: [null, Validators.compose([Validators.required])],
      email: [
        null,
        Validators.compose([Validators.email, Validators.required]),
      ],
      phoneNo: [null, Validators.compose([Validators.required])],
      address: [
        null,
        // Validators.compose([Validators.required])
      ],
      password: [
        null,
        Validators.compose([
          Validators.required,
          // check whether the entered password has a number
          // CustomValidators.patternValidator(/\d/, {
          //   hasNumber: true
          // }),
          // // check whether the entered password has upper case letter
          // CustomValidators.patternValidator(/[A-Z]/, {
          //   hasCapitalCase: true
          // }),
          // // check whether the entered password has a lower case letter
          // CustomValidators.patternValidator(/[a-z]/, {
          //   hasSmallCase: true
          // }),
          // // check whether the entered password has a special character
          // CustomValidators.patternValidator(
          //   /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
          //   {
          //     hasSpecialCharacters: true
          //   }
          // ),
          Validators.minLength(8),
        ]),
      ],
      confirmPassword: [null, Validators.compose([null, Validators.required])],
    };

    // selectedPlan is in uppercase, creating form controls for enterprise plan
    if (this.selectedPlan === 'ENTERPRISE') {
      formElementsObject.requestedStorageSpace = new FormControl(
        '',
        Validators.required
      );
      formElementsObject.requestedLocations = new FormControl(
        '',
        Validators.required
      );
      formElementsObject.message = new FormControl('');
    }

    return this.fb.group(formElementsObject, {
      // check whther our password and confirm password match
      validator: CustomValidators.passwordMatchValidator,
    });
  }

  // isFirstTime(_inputField: 'name' | 'email' | 'password' | 'matchPassword'): Boolean {
  //   if (_inputField == 'name') { return this.isFirstTimeName; }
  //   else if (_inputField == 'email') { return this.isFirstTimeEmail; }
  //   else if (_inputField == 'password') { return this.isFirstTimePassword; }
  //   else if (_inputField == 'matchPassword') { return this.isFirstTimePasswordMatch; }
  // }

  // changeIsFirstTime(_inputField: 'name' | 'email' | 'password' | 'matchPassword'): void {
  //   if (_inputField == 'name') { this.isFirstTimeName = false; }
  //   else if (_inputField == 'email') { this.isFirstTimeEmail = false; }
  //   else if (_inputField == 'password') { this.isFirstTimePassword = false; }
  //   else if (_inputField == 'matchPassword') { this.isFirstTimePasswordMatch = false; }
  // }

  // controls form submition of sign up
  submit(): void {
    this.formSubmitting = true;

    this.frmSignup.value.selectedPlan = this.selectedPlan;
    this.frmSignup.value.selectedPlanId = this.selectedPlanId;

    // making email address upper case
    this.frmSignup.value.email = this.frmSignup.value.email.toLowerCase();

    this.auth.register(this.frmSignup.value).subscribe(
      (data) => {
        // saving email for the next phase of verfication code
        GenericService.userEmailForNotLoggedInUser = this.frmSignup.value.email;

        this.toast.add(
          // tslint:disable-next-line:max-line-length
          {
            key: 'top-center-notActiveUserLogin',
            life: 4000,
            severity: 'warn',
            summary:
              'Please check your email for activation code. Also check Junk/Spam folder.',
          }
        );
        this.formSubmitting = false;
        this.router.navigateByUrl(
          'verify-token/' + BaseHelpers.getVerificationCodeType().signup
        );
      },
      (err) => {
        console.error(err);

        // raze error message for different error types.
        if (err.status == 401) {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'Error! Please try again.',
            closable: false,
          });
          // email already registered
        } else if (
          err.status == 501 &&
          err.error &&
          err.error.message &&
          err.error.message.name == 'SequelizeUniqueConstraintError'
        ) {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'Email already registered! Please login.',
            closable: false,
          });
        }

        this.formSubmitting = false;
      }
    );
  }

  disableForm() {
    return !this.frmSignup.valid || this.formSubmitting;
  }
}
