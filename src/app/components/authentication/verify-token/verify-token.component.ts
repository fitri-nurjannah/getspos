import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import moment from 'moment';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { ToastService } from '@core/services/toast.service';
import { BaseHelpers } from '@root/src/app/helpers/baseHelpers';
import { GenericService } from '@root/src/app/services/generic.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-verify-token',
    templateUrl: './verify-token.component.html',
    styleUrls: ['./verify-token.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RouterLink,
        FormsModule,
        DatePipe
    ]
})
export class VerifyTokenComponent implements OnInit {
  verifyToken = '';
  tokenfor = '';
  userEmail;
  isResendCodeButtonActive = false;
  isResendCodeAnimationActive = false;
  checkingVerificationCode = false;
  resendAnimatedTime: any;
  resendCodeTimeInterval;
  isResendingCode = false;
  private toast = inject(ToastService);
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private auth: AuthenticationService
  ) {}

  ngOnInit() {
    // getting email address of the user
    this.userEmail = GenericService.userEmailForNotLoggedInUser;

    // if we do not have email in the variable or not int the cookie
    if (!this.userEmail) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.tokenfor = this.activatedRoute.snapshot.paramMap.get('tokenFor');

    this.activateTimeInterval();
  }

  activateTimeInterval() {
    const timeIntervalInMinutes = 1;
    
    // Set initial time: 1 minute from "zero" (1970-01-01 00:01:00)
    // This makes the DatePipe | date:'mm:ss' work perfectly
    let duration = moment().startOf('day').add(timeIntervalInMinutes, 'minutes');
    
    // Store as JS Date initially for the pipe
    this.resendAnimatedTime = duration.toDate();
    this.isResendCodeButtonActive = false;
  
    const timeSetInterval = setInterval(() => {
      // Clone the current time and subtract 1 second
      duration = moment(duration).subtract(1, 'second');
      
      // Update the variable with a new JS Date reference
      this.resendAnimatedTime = duration.toDate();
  
      // If we reach "zero" (the start of the day we set)
      if (duration.get('minute') === 0 && duration.get('second') === 0) {
        this.isResendCodeButtonActive = true;
        clearInterval(timeSetInterval);
      }
    }, 1000);
  }

  checkVerificationCode() {
    const objectToSend = {
      email: this.userEmail,
      code: this.verifyToken,
      tokenFor: this.tokenfor,
    };
    this.checkingVerificationCode = true;

    this.auth.verifytoken(objectToSend).subscribe(
      (_data) => {
        this.checkingVerificationCode = false;

        if (
          this.tokenfor == BaseHelpers.getVerificationCodeType().forgotPassword
        ) {
          this.toast.add({
            key: 'top-center',
            life: 1500,
            severity: 'success',
            summary: 'Please Enter Password Now!',
          });

          this.router.navigateByUrl('/forgot-password/change-password');
        } else if (
          this.tokenfor == BaseHelpers.getVerificationCodeType().signup
        ) {
          this.toast.add({
            key: 'top-center',
            life: 1500,
            severity: 'success',
            summary: 'Email Verified! Please login now.',
          });

          this.router.navigateByUrl('/login');
        }
        
        return;
      },
      (_error) => {
        console.error(_error);

        if (_error && _error.error.message == 'tokenexpired') {
          this.toast.add({
            key: 'top-center',
            severity: 'warn',
            summary: 'Code Expired! Please generate new one.',
          });
        } else {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary:
              'An error occured! Please check internet or try again after refreshing page.',
          });
        }
        this.checkingVerificationCode = false;
      }
    );
  }

  resendCode() {
    const objectToSend = {
      tokenFor: this.tokenfor,
      email: this.userEmail,
    };

    this.isResendingCode = true; // Start loading state

    this.auth.sendVerificationCodeEmail(objectToSend).subscribe({
      next: (_data) => {
        this.activateTimeInterval();
        this.toast.add({
          key: 'top-center',
          life: 1500,
          severity: 'success',
          summary: 'Code Sent! Please Check Your Email Inbox.',
        });
        this.isResendingCode = false;
      },
      error: (_error) => {
        this.isResendingCode = false;
        if (_error?.error?.message === 'youAreNotAllowed') {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'You are not allowed here! Please Login or Sign Up.',
          });
        } else {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'An error occured! Please try again later.',
          });
        }
      }
    });
  }
}
