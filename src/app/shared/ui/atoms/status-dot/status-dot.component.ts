import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 'active' | 'inactive' | 'warn' | 'error' | boolean;

@Component({
  imports: [ CommonModule ],
  selector: 'app-status-dot',
  styleUrl: './status-dot.component.css',
  templateUrl: './status-dot.component.html',
})
export class StatusDotComponent {
  status = input.required<StatusType>();

  colorClass = computed(() => {
    const s = this.status();
    if (s === true || s === 'active') return 'bg-emerald-500 shadow-emerald-500/30';
    if (s === false || s === 'inactive') return 'bg-slate-300';
    if (s === 'warn') return 'bg-amber-500 shadow-amber-500/30';
    if (s === 'error') return 'bg-rose-500 shadow-rose-500/30';
    return 'bg-slate-300';
  });
}