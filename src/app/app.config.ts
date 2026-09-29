import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withXhr } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { ToastService } from '@core/services/toast.service';

// Third Party
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';

// Local
import { routes } from './app.routes';
import { BaseServicesService } from './services/base-services.service';
import { RedirectGuardService } from './services/RedirectGuard.service';
import { SocketConfigs } from './services/socket-configs.service';
import { HTTPListener } from './interceptors/ngxUiLoaderHttpInterceptor';

// It is better to get this from a static constant if possible
const baseService = new BaseServicesService();
const config: SocketIoConfig = { url: baseService.getPath(), options: {} };

const DEFAULT_DROPZONE_CONFIG = {
  url: 'localhost/111',
  timeout: 1800000,
  maxFilesize: 2048,
  acceptedFiles: 'application/pdf, image/jpeg, image/png, image/gif, video/mp4, application/vnd.openxmlformats-officedocument.presentationml.presentation, audio/mpeg',
  addRemoveLinks: true,
};

export const appConfig: ApplicationConfig = {
  providers: [
    ToastService,
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideAnimations(), // Kept this, removed Async
    provideNativeDateAdapter(),

    // Socket.io
    importProvidersFrom(SocketIoModule.forRoot(config)),
    
    // Custom Providers
    { provide: DROPZONE_CONFIG, useValue: DEFAULT_DROPZONE_CONFIG },
    { provide: HTTP_INTERCEPTORS, useClass: HTTPListener, multi: true },
    
    // Services
    SocketConfigs,
    RedirectGuardService
  ]
};