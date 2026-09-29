import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-wizard-layout',
  imports: [ RouterOutlet ],
  templateUrl: './wizard-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './wizard-layout.component.css'
})
export class WizardLayoutComponent {

}
