import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div class="toast toast--{{ toast.type }}" role="alert">
          <div class="toast__icon">
            @if (toast.type === 'success') { <i class="fas fa-check-circle"></i> }
            @if (toast.type === 'error')   { <i class="fas fa-times-circle"></i> }
            @if (toast.type === 'info')    { <i class="fas fa-info-circle"></i> }
          </div>
          <div class="toast__body">
            <p class="toast__title">{{ toast.title }}</p>
            <p class="toast__message">{{ toast.message }}</p>
          </div>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">
            <i class="fas fa-times"></i>
          </button>
          <div class="toast__progress" [style.animation-duration]="toast.duration + 'ms'"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 88px;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 380px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      padding: 1rem 1rem 1.25rem 1.125rem;
      border-radius: 12px;
      border: 1px solid;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
      position: relative;
      overflow: hidden;
      pointer-events: all;
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .toast--success { background: rgba(10,20,15,0.94); border-color: rgba(34,197,94,0.4); }
    .toast--error   { background: rgba(20,10,10,0.94); border-color: rgba(239,68,68,0.4); }
    .toast--info    { background: rgba(10,15,25,0.94); border-color: rgba(0,174,220,0.4); }

    .toast__icon { font-size: 1.375rem; flex-shrink: 0; margin-top: 1px; }
    .toast--success .toast__icon { color: #22c55e; }
    .toast--error   .toast__icon { color: #ef4444; }
    .toast--info    .toast__icon { color: #00aedc; }

    .toast__body { flex: 1; min-width: 0; }

    .toast__title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.2rem;
      line-height: 1.3;
    }

    .toast__message {
      font-size: 0.8125rem;
      color: rgba(255,255,255,0.72);
      margin: 0;
      line-height: 1.5;
    }

    .toast__close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      transition: all 0.15s ease;
      cursor: pointer;
      border: none;
      margin-top: 1px;
    }

    .toast__close:hover { background: rgba(255,255,255,0.18); color: #ffffff; }

    .toast__progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      border-radius: 0 0 12px 12px;
      animation: toastProgress linear forwards;
      transform-origin: left;
    }

    .toast--success .toast__progress { background: #22c55e; }
    .toast--error   .toast__progress { background: #ef4444; }
    .toast--info    .toast__progress { background: #00aedc; }

    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(110%) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes toastProgress {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }

    :host-context(body.light) .toast--success { background: rgba(240,255,245,0.97); border-color: rgba(34,197,94,0.45); }
    :host-context(body.light) .toast--error   { background: rgba(255,242,242,0.97); border-color: rgba(239,68,68,0.45); }
    :host-context(body.light) .toast--info    { background: rgba(240,250,255,0.97); border-color: rgba(0,174,220,0.45); }
    :host-context(body.light) .toast__title   { color: #0a0f14; }
    :host-context(body.light) .toast__message { color: #4a5f6e; }
    :host-context(body.light) .toast__close   { color: #6a7f8e; background: rgba(0,0,0,0.06); }
    :host-context(body.light) .toast__close:hover { background: rgba(0,0,0,0.12); color: #0a0f14; }

    @media (max-width: 480px) {
      .toast-container {
        top: auto;
        bottom: 1.25rem;
        right: 1rem;
        left: 1rem;
        width: auto;
        max-width: 100%;
      }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
