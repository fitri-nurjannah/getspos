import { Routes } from '@angular/router';
import { AuthGuardService } from '../../services/auth-guard-service.service';
import { SharedLayoutsComponent } from './shared-layouts-component/shared-layouts.component';
import { ProfileComponent } from '../../components/user/profile/profile.component';
import { FilesGalleryComponent } from '@root/src/app/components/files-gallery/files-gallery.component';
import { UsersComponent } from '@root/src/app/components/authentication/users/users.component';
import { ChangePasswordComponent } from '@root/src/app/components/authentication/change-password/change-password.component';
import { PlaylistStatusComponent } from '@root/src/app/components/playlist-status/playlist-status.component';

export const SHARED_LAYOUTS_ROUTES: Routes = [
  {
    path: '',
    component: SharedLayoutsComponent,
    children: [
      {
        path: 'file-storage',
        loadChildren: () => import('../../components/file-storage/file-storage.routes').then(m => m.FILE_STORAGE_ROUTES),
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../../components/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'sub-accounts',
        loadChildren: () => import('../../components/sub-account/sub-account.routes').then(m => m.SUB_ACCOUNT_ROUTES),
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuardService],
        data: { animation: 'Profile' },
      },
      {
        path: 'dashboard/play/:id/files',
        component: FilesGalleryComponent,
        canActivate: [AuthGuardService],
        data: { animation: 'FilesGallery' },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthGuardService],
        data: { animation: 'User' },
      },
      {
        path: 'playlist/status',
        component: PlaylistStatusComponent,
        canActivate: [AuthGuardService],
        data: { animation: 'Status' },
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [AuthGuardService],
        data: { animation: 'CheckpointList' },
      },
    ],
  },
];