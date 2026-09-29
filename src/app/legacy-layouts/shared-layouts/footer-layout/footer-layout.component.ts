import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-footer-layout',
    templateUrl: './footer-layout.component.html',
    styleUrls: ['./footer-layout.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class FooterLayoutComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
  }

}
