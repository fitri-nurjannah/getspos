import {
    transition,
    trigger,
    query,
    style,
    animate,
    group,
    animateChild
 } from '@angular/animations';

export const animations = [
trigger(
  'enterAnimation', [
    transition(':enter', [
      style({opacity: 0}),
      animate('500ms', style({opacity: 1}))
    ]),
    transition(':leave', [
      style({opacity: 1}),
      animate('200ms', style({opacity: 0}))
    ])
  ]),

  // only enter animation
  trigger(
    'onlyEnterAnimation', [
      transition(':enter', [
        style({opacity: 0}),
        animate('500ms', style({opacity: 1}))
      ]),
      transition(':leave', [
        style({opacity: 0})
      ])
    ])
  ];
