// components/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { AuthGuardService } from '@root/src/app/services/auth-guard-service.service';
import { DashboardComponent } from './dashboard-component/dashboard.component';
import { PlaylistComponent } from './slider/playlist.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
    data: { animation: 'Dashboard' },
    children: [
      {
        path: 'play',
        component: PlaylistComponent,
        data: { animation: 'Slider' },
      },
      {
        path: 'play/:id',
        component: PlaylistComponent,
        data: { animation: 'Slider' },
      },
    ],
  },
];