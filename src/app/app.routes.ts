// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { RedirectGuardService } from './services/RedirectGuard.service';
import { BaseServicesService } from './services/base-services.service';
import { AuthGuardService } from './services/auth-guard-service.service';

const baseService = new BaseServicesService();

export const routes: Routes = [
  // =========================================================================
  // 1. ROOT PATH REDIRECTION (LEGACY - UNTOUCHED)
  // =========================================================================
  { 
    path: '', 
    canActivate: [RedirectGuardService], 
    component: RedirectGuardService, 
    pathMatch: 'full',
    data: { externalUrl: baseService.getPath() },
  },

  // =========================================================================
  // 2. NEW ATOMIC FEATURE: CHRONO BOARD
  // =========================================================================
  {
    path: 'chrono-board',
    canActivate: [AuthGuardService],
    children: [
      // Creation Flow (Screens 19 - 22) uses the Wizard Layout
      {
        path: 'create',
        loadComponent: () =>
          import('./layouts/wizard-layout/wizard-layout.component').then(
            (m) => m.WizardLayoutComponent
          ),
        loadChildren: () =>
          import(
            './features/chrono-board/pages/chrono-wizard/chrono-wizard.routes'
          ).then((m) => m.CHRONO_WIZARD_ROUTES),
      },
      // Editor Studio Canvas (Screens 23, 49 - 50) uses the Workspace Layout
      {
        path: 'edit/:id',
        loadComponent: () =>
          import(
            './layouts/workspace-layout/workspace-layout.component'
          ).then((m) => m.WorkspaceLayoutComponent),
        loadChildren: () =>
          import(
            './features/chrono-board/pages/chrono-editor/chrono-editor.routes'
          ).then((m) => m.CHRONO_EDITOR_ROUTES),
      },
    ],
  },

  // =========================================================================
  // 3. LEGACY APPLICATION ROUTES (UNTOUCHED)
  // =========================================================================
  { 
    path: '', 
    loadChildren: () =>
      import('./legacy-layouts/no-layouts/no-layouts.routes').then(
        (m) => m.NO_LAYOUTS_ROUTES
      ),
  },
  { 
    path: '',
    loadChildren: () =>
      import('./legacy-layouts/shared-layouts/shared-layouts.routes').then(
        (m) => m.SHARED_LAYOUTS_ROUTES
      ),
  },
];