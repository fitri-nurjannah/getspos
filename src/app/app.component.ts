import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { slideInAnimation } from './route-animation';
import { animations } from './animations';
import { SPINNER, POSITION, NgxUiLoaderModule } from 'ngx-ui-loader';
import { environment } from '@root/src/environments/environment';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '@shared/ui/molecules/toast-container/toast-container.component';

declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [slideInAnimation, animations],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgxUiLoaderModule, RouterOutlet, ToastContainerComponent]
})
export class AppComponent {
  SPINNER = SPINNER;
  POSITION = POSITION;

  constructor(
    private _router: Router
  ) {
    if (environment.production) {
      this._router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'UA-170120648-1', {
            // eslint-disable-next-line camelcase
            page_path: event.urlAfterRedirects,
          });
        }
      });
    }
  }
}