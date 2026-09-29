// layouts/no-layouts/no-layouts.routes.ts
import { Routes } from '@angular/router';
import { NoLayoutsComponent } from './no-layouts-component/no-layouts.component';
import { LoginComponent } from '../../components/authentication/login/login.component';
import { SignupComponent } from '../../components/authentication/signup/signup.component';
import { MessageComponent } from '../../components/message/message.component';
import { CheckoutComponent } from '@root/src/app/components/authentication/checkout/checkout.component';
import { VerifyTokenComponent } from '@root/src/app/components/authentication/verify-token/verify-token.component';
import { GetEmailComponent } from '@root/src/app/components/authentication/forgotpassword/get-email/get-email.component';
import { ForgotPasswordChangePasswordComponent } from '@root/src/app/components/authentication/forgotpassword/forgot-password-change-password/forgot-password-change-password.component';

export const NO_LAYOUTS_ROUTES: Routes = [
  {
    path: '',
    component: NoLayoutsComponent,
    children: [
      { path: 'login', component: LoginComponent, data: { animation: 'Login' } },
      { path: 'signup/:selectedPlan/:planId', component: SignupComponent, data: { animation: 'SignUp' } },
      { path: 'message/:message', component: MessageComponent, data: { animation: 'Message' } },
      { path: 'verify-token/:tokenFor', component: VerifyTokenComponent, data: { animation: 'VerifyToken' } },
      { path: 'checkout', component: CheckoutComponent, data: { animation: 'Checkout' } },

      // forgot password
      { path: 'forgot-password/get-email', component: GetEmailComponent, data: { animation: 'GetEmail' } },
      { path: 'forgot-password/change-password', component: ForgotPasswordChangePasswordComponent, data: { animation: 'ForgotPasswordChangePassword' } },

      { 
        path: 'privacy-policy',
        loadChildren: () => import('../../components/authentication/privacy-policy/privacy-policy.routes').then((m) => m.PRIVACY_POLICY_ROUTES), 
        data: { animation: 'GetEmail' } 
      }
    ]
  }
];