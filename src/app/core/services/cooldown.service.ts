import { Injectable, signal, computed } from '@angular/core';

export interface CooldownState {
  isActive: boolean;
  remainingSeconds: number;
  triggeredAt: number | null;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class CooldownService {
  private _cooldown = signal<CooldownState>({
    isActive: false,
    remainingSeconds: 0,
    triggeredAt: null,
    reason: ''
  });

  cooldown = this._cooldown.asReadonly();
  isActive = computed(() => this._cooldown().isActive);
  remainingSeconds = computed(() => this._cooldown().remainingSeconds);

  private timerRef: any = null;

  /**
   * Activate cooldown overlay
   * @param remainingMs - milliseconds to cool down (default 120000 = 2 min)
   * @param reason - message to display
   */
  activate(remainingMs: number = 120000, reason: string = 'Too many requests') {
    // Clear any existing timer
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }

    const triggeredAt = Date.now();
    const endTime = triggeredAt + remainingMs;

    this._cooldown.set({
      isActive: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      triggeredAt,
      reason
    });

    // Start countdown
    this.timerRef = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const remainingSec = Math.ceil(remaining / 1000);

      if (remaining <= 0) {
        this.deactivate();
        return;
      }

      this._cooldown.set({
        isActive: true,
        remainingSeconds: remainingSec,
        triggeredAt,
        reason
      });
    }, 250);
  }

  deactivate() {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }

    this._cooldown.set({
      isActive: false,
      remainingSeconds: 0,
      triggeredAt: null,
      reason: ''
    });
  }

  /**
   * Parse retry-after header or use default
   */
  getRetryDelay(headers: Headers): number {
    const retryAfter = headers.get('retry-after');
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000;
      }
    }
    return 120000; // Default 2 minutes
  }

  ngOnDestroy() {
    this.deactivate();
  }
}
