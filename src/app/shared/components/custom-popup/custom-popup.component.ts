import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PopupConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Component({
  selector: 'app-custom-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-popup-overlay" *ngIf="isVisible" (click)="onOverlayClick()">
      <div class="popup-content glass" (click)="$event.stopPropagation()">
        <div class="popup-header" [class]="config?.type">
          <div class="popup-icon">
            <i [class]="getIconClass()"></i>
          </div>
          <h3>{{ config?.title }}</h3>
        </div>

        <div class="popup-body">
          <p>{{ config?.message }}</p>
        </div>

        <div class="popup-actions">
          <button
            *ngIf="config?.showCancel !== false"
            class="btn-cancel"
            (click)="onCancel()">
            {{ config?.cancelText || 'Cancel' }}
          </button>
          <button
            class="btn-confirm"
            [class]="config?.type"
            (click)="onConfirm()">
            {{ config?.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease;
    }

    .popup-content {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      width: 90%;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    }

    .popup-header {
      padding: 1.5rem 1.5rem 1rem;
      text-align: center;
      border-bottom: 1px solid var(--border-color);
    }

    .popup-header.success {
      border-bottom-color: #10b981;
    }

    .popup-header.error {
      border-bottom-color: #ef4444;
    }

    .popup-header.warning {
      border-bottom-color: #f59e0b;
    }

    .popup-header.info {
      border-bottom-color: var(--primary);
    }

    .popup-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .popup-icon i {
      padding: 1rem;
      border-radius: 50%;
    }

    .popup-header.success .popup-icon i {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .popup-header.error .popup-icon i {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .popup-header.warning .popup-icon i {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .popup-header.info .popup-icon i {
      background: rgba(59, 130, 246, 0.1);
      color: var(--primary);
    }

    .popup-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }

    .popup-body {
      padding: 1.5rem;
    }

    .popup-body p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.6;
      text-align: center;
    }

    .popup-actions {
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .popup-actions button {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .btn-cancel {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .btn-cancel:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .btn-confirm {
      background: var(--primary);
      color: white;
    }

    .btn-confirm:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn-confirm.success {
      background: #10b981;
    }

    .btn-confirm.success:hover {
      background: #059669;
    }

    .btn-confirm.error {
      background: #ef4444;
    }

    .btn-confirm.error:hover {
      background: #dc2626;
    }

    .btn-confirm.warning {
      background: #f59e0b;
    }

    .btn-confirm.warning:hover {
      background: #d97706;
    }

    .btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .popup-content {
        width: 95%;
        margin: 1rem;
      }

      .popup-actions {
        flex-direction: column;
      }

      .btn-cancel, .btn-confirm {
        width: 100%;
      }
    }
  `]
})
export class CustomPopupComponent {
  @Input() isVisible = false;
  @Input() config: PopupConfig | null = null;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(): void {
    this.closed.emit();
  }

  getIconClass(): string {
    if (!this.config) return 'fas fa-question-circle';

    switch (this.config.type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-question-circle';
    }
  }
}