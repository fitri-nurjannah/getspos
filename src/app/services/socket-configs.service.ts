import { ApplicationRef, inject, Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';
import { BaseServicesService } from './base-services.service';

@Injectable()
export class SocketConfigs extends Socket {
  constructor() {
    const baseService = new BaseServicesService();
    super({ url: baseService.getPath(), options: {} }, inject(ApplicationRef));
  }
}


