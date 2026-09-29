import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseServicesService {
  constructor() {}

  private websiteProtol = window.location.href.split(':')[0];
  private path = '';
  private domain = this.websiteProtol + '://getspost.com';

  getPath() {
    const hostName = window.location.hostname;

    if (hostName != 'localhost') {
      return this.path;
    }

    return 'http://localhost:3000';
  }

  getDomain() {
    const hostName = window.location.hostname;

    if (hostName != 'localhost') {
      return this.domain;
    }

    return 'http://localhost:3000';
  }
}