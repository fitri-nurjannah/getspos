import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'danger';

@Component({
  imports: [ CommonModule ],
  selector: 'app-badge',
  styleUrl: './badge.component.css',
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  value = input.required<string | number>();
  variant = input<BadgeVariant>('default');

  variantClass = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'bg-purple-100 text-purple-700';
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'danger':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  });
}