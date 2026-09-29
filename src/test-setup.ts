import '@analogjs/vitest-angular/setup-zone';
import { beforeEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
  {
    teardown: { destroyAfterEach: true }
  }
);

// Provide global fallbacks so legacy spec files don't crash on missing HttpClient/Router
beforeEach(() => {
  getTestBed().configureTestingModule({
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([])
    ]
  });
});