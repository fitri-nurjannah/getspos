import { Component, ChangeDetectionStrategy } from '@angular/core';
import { slideInAnimation } from '@root/src/app/route-animation';

import { SubscriptionAlertComponent } from '../../../components/authentication/subscription-alert/subscription-alert.component';
import { HeaderLayoutComponent } from '../header-layout/header-layout.component';
import { MenuLayoutComponent } from '../menu-layout/menu-layout.component';
import { RouterOutlet } from '@angular/router';
import { FooterLayoutComponent } from '../footer-layout/footer-layout.component';

@Component({
  selector: 'app-shared-layouts',
  templateUrl: './shared-layouts.component.html',
  styleUrls: ['./shared-layouts.component.css'],
  animations: [slideInAnimation],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    SubscriptionAlertComponent,
    HeaderLayoutComponent,
    MenuLayoutComponent,
    RouterOutlet,
    FooterLayoutComponent
  ]
})
export class SharedLayoutsComponent {

  constructor() {}
}
