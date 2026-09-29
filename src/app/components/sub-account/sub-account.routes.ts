// components/sub-account/sub-account.routes.ts
import { Routes } from '@angular/router';
import { AuthGuardMasterService } from '@root/src/app/services/auth-guard-master.service';
import { SubAccountComponent } from './sub-account.component';
import { SubAccountDeleteComponent } from './sub-account-delete/sub-account-delete.component';
import { SubAccountCreateEditComponent } from './sub-account-create-edit/sub-account-create-edit.component';

export const SUB_ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: SubAccountComponent,
    canActivate: [AuthGuardMasterService],
    data: { animation: 'SubAccount' },
    children: [
      {
        path: 'delete/:id',
        component: SubAccountDeleteComponent,
      },
      {
        path: ':modalFor/:id',
        component: SubAccountCreateEditComponent,
      },
    ],
  },
];