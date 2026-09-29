import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { slideInAnimation } from '../../../route-animation';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-no-layouts',
    templateUrl: './no-layouts.component.html',
    styleUrls: ['./no-layouts.component.css'],
    animations: [slideInAnimation],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class NoLayoutsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
