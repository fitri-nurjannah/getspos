import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';


@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class MessageComponent implements OnInit {
  messageAbout = '';

  constructor(private readonly activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.messageAbout = this.activatedRoute.snapshot.paramMap.get('message');
  }

  checkMessage(): any {
    return this.messageAbout == 'tokenexpired';
  }

}
