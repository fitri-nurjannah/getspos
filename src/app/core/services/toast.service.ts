import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id?: string;
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  key?: string;
  life?: number;
  showSpinner?: boolean;
  sticky?: boolean;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  add(msg: ToastMessage): void {
    const id = msg.id || crypto.randomUUID();
    const isSpinner = msg.key?.includes('spinner') || msg.showSpinner || false;
    const isSticky = msg.sticky === true;

    const toast: ToastMessage = {
      ...msg,
      id,
      severity: msg.severity || 'info',
      showSpinner: isSpinner,
      sticky: isSticky,
      closable: msg.closable ?? true,
    };

    this._toasts.update((current) => [...current, toast]);

    // 🚀 Only start the auto-dismiss timer if NOT sticky!
    if (!isSticky) {
      const duration = msg.life ?? (isSpinner ? 10000 : 4000);
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}