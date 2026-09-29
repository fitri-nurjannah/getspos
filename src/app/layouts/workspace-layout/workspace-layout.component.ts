import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-workspace-layout',
  imports: [ RouterOutlet ],
  templateUrl: './workspace-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './workspace-layout.component.css'
})
export class WorkspaceLayoutComponent {

}
