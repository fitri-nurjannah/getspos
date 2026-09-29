import { Routes } from '@angular/router';

export const CHRONO_WIZARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./chrono-wizard.component').then((m) => m.ChronoWizardComponent),
  },
];