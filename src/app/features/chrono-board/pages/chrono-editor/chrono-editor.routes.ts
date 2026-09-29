import { Routes } from '@angular/router';

export const CHRONO_EDITOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./chrono-editor.component').then((m) => m.ChronoEditorComponent),
  },
];