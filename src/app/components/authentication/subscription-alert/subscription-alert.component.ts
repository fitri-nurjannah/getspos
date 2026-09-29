import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-subscription-alert',
    templateUrl: './subscription-alert.component.html',
    styleUrls: ['./subscription-alert.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ CommonModule ]
})
export class SubscriptionAlertComponent implements OnInit {
  messages = [];
  constructor(
    private auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      const userDetails = this.auth.getUserDetails();
      // we shows message of package start if user is not admin
      if (!userDetails.isAdmin && userDetails.subscriptionEndDate) {
        this.initSubscriptionAlerts();
      }
    }, 1000);
  }

  initSubscriptionAlerts(): void {
    const user = this.auth.getUserDetails();
    const alreadyShown = sessionStorage.getItem('alert-shown');

    if (user?.isFirstTimeLoggedIn && !alreadyShown && this.messages.length === 0) {
      this.messages = [{
        severity: 'warn',
        summary: 'Alert!',
        detail: `Your account will be active until ${user.subscriptionEndDate}`,
      }];
      sessionStorage.setItem('alert-shown', 'true');
  
      this.editFirstTimeLoggedIn();
    }
  }

  editFirstTimeLoggedIn(): void {
    this.auth.editFirstTimeLoggedIn().subscribe({
      next: (userReceived) => {
        console.log('User status updated');
      },
      error: (err) => {
        console.error('Error updating first time login status:', err);
      }
    });
  }
}
