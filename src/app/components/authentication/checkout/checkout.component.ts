import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ApiService } from '@root/src/app/services/api.service';
import { GenericService } from '@root/src/app/services/generic.service';
import { HttpClient } from '@angular/common/http';
import { User } from '@root/src/app/interfaces/interfaces';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormsModule,
        TitleCasePipe,
        DatePipe
    ]
})
export class CheckoutComponent implements OnInit {
  checkoutDetails;
  user: User;
  userEmail: string;
  private toast = inject(ToastService);
  constructor(
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.userEmail = GenericService.userEmailForNotLoggedInUser;

    if (!this.userEmail) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.checkout();
  }

  checkout() {
    const objectToSend: any = {};

    objectToSend.email = this.userEmail;

    this.apiService.checkout(objectToSend).subscribe(
      (_data) => {
        this.checkoutDetails = _data.checkoutDetails;
        this.user = _data.userDetails;
        // this.callToIpay(_data);
        // this.toast.add({key: 'top-center', life: 1500, severity: 'success', summary: 'Session Created!'});
      },
      (_error) => {
        // if user already paid amount
        if (
          _error &&
          _error.error &&
          _error.error.message == 'youAreNotAllowed'
        ) {
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary:
              'You are not allowed on checkout page! Please Login if you are not.',
          });
          this.router.navigateByUrl('login');
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
