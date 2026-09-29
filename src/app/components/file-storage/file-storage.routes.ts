// components/file-storage/file-storage.routes.ts
import { Routes } from '@angular/router';
import { AuthGuardMasterService } from '@root/src/app/services/auth-guard-master.service';
import { FileStorageComponentComponent } from './file-storage-component.component';

export const FILE_STORAGE_ROUTES: Routes = [
  {
    path: '',
    component: FileStorageComponentComponent,
    canActivate: [AuthGuardMasterService],
    data: { animation: 'FileStorage' },
  },
];