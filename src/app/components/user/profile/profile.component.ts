import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class ProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
