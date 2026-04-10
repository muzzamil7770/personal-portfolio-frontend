import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CooldownService } from '../../../core/services/cooldown.service';

@Component({
  selector: 'app-cooldown-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cooldown-overlay" *ngIf="cooldown().isActive">
      <div class="cooldown-card">
        <!-- Animated Shield Icon -->
        <div class="cooldown-icon">
          <div class="shield">
            <svg viewBox="0 0 64 64" class="shield-svg">
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#818cf8;stop-opacity:1" />
                </linearGradient>
              </defs>
              <path d="M32 4L8 16v16c0 14 10 24 24 28 14-4 24-14 24-28V16L32 4z" fill="url(#shieldGrad)" />
              <path d="M28 34l-8-8 4-4 4 4 8-8 4 4z" fill="#fff" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2 class="cooldown-title">🚫 Too Many Requests</h2>
        <p class="cooldown-reason">{{ cooldown().reason || 'Please wait before making another request.' }}</p>

        <!-- Countdown Timer -->
        <div class="cooldown-timer">
          <div class="timer-circle">
            <svg class="timer-svg" viewBox="0 0 100 100">
              <circle
                class="timer-track"
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#1e293b"
                stroke-width="6"
              />
              <circle
                class="timer-progress"
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#6366f1"
                stroke-width="6"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="dashOffset"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="timer-text">
              <span class="timer-number">{{ cooldown().remainingSeconds }}</span>
              <span class="timer-unit">seconds</span>
            </div>
          </div>
        </div>

        <!-- Animated Dots -->
        <div class="cooldown-dots">
          <span class="dot" *ngFor="let i of [1,2,3,4,5]"></span>
        </div>

        <p class="cooldown-hint">
          ⏳ Cooling down... Please try again after the timer reaches zero.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .cooldown-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.95);
      backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: cooldown-fade-in 0.5s ease;
    }
    @keyframes cooldown-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .cooldown-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 2.5rem 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.6);
      animation: cooldown-slide-up 0.6s ease;
    }
    @keyframes cooldown-slide-up {
      from { opacity: 0; transform: translateY(40px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Shield Icon */
    .cooldown-icon {
      margin-bottom: 1.5rem;
    }
    .shield {
      display: inline-block;
      animation: shield-pulse 2s ease-in-out infinite;
    }
    @keyframes shield-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    .shield-svg {
      width: 72px;
      height: 72px;
      filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
    }

    /* Title */
    .cooldown-title {
      color: #f1f5f9;
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }
    .cooldown-reason {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0 0 2rem;
      line-height: 1.5;
    }

    /* Timer */
    .cooldown-timer {
      margin-bottom: 1.5rem;
    }
    .timer-circle {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }
    .timer-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .timer-track {
      stroke: #1e293b;
    }
    .timer-progress {
      stroke: #6366f1;
      transition: stroke-dashoffset 0.25s ease;
    }
    .timer-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .timer-number {
      color: #f1f5f9;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      font-family: 'Courier New', monospace;
    }
    .timer-unit {
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 2px;
    }

    /* Animated Dots */
    .cooldown-dots {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6366f1;
      animation: cooldown-bounce 1.4s ease-in-out infinite;
    }
    .dot:nth-child(1) { animation-delay: 0s; }
    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.3s; }
    .dot:nth-child(4) { animation-delay: 0.45s; }
    .dot:nth-child(5) { animation-delay: 0.6s; }
    @keyframes cooldown-bounce {
      0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; background: #334155; }
      40% { transform: scale(1.2); opacity: 1; background: #6366f1; }
    }

    /* Hint */
    .cooldown-hint {
      color: #64748b;
      font-size: 0.8rem;
      margin: 0;
      font-style: italic;
    }
  `]
})
export class CooldownOverlayComponent {
  circumference = 2 * Math.PI * 42; // ~263.89

  constructor(public cooldownService: CooldownService) {}

  cooldown:any = this.cooldownService.cooldown;

  get dashOffset(): number {
    const remaining = this.cooldown().remainingSeconds;
    const total = this.cooldown().triggeredAt
      ? Math.ceil((Date.now() - this.cooldown().triggeredAt) / 1000 + remaining)
      : 120;
    const progress = total > 0 ? remaining / total : 0;
    return this.circumference * (1 - progress);
  }
}
