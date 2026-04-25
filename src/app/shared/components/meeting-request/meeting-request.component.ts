import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-meeting-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="meeting-request-modal" *ngIf="isVisible" (click)="close()">
      <div class="modal-content glass" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><i class="fas fa-video"></i> Request Video Meeting</h3>
          <button (click)="close()" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-description">
            Schedule a video meeting with me. I'll review your request and get back to you soon.
          </p>

          <form [formGroup]="requestForm" (ngSubmit)="submitRequest()" class="request-form">
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="Enter your full name"
                class="form-input"
                [class.error]="requestForm.get('name')?.invalid && requestForm.get('name')?.touched">
              <div class="error-msg" *ngIf="requestForm.get('name')?.invalid && requestForm.get('name')?.touched">
                <span *ngIf="requestForm.get('name')?.errors?.['required']">Name is required</span>
                <span *ngIf="requestForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters</span>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email Address *</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter your email address"
                class="form-input"
                [class.error]="requestForm.get('email')?.invalid && requestForm.get('email')?.touched">
              <div class="error-msg" *ngIf="requestForm.get('email')?.invalid && requestForm.get('email')?.touched">
                <span *ngIf="requestForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="requestForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
              </div>
            </div>

            <div class="form-group">
              <label for="topic">Meeting Topic (Optional)</label>
              <input
                id="topic"
                type="text"
                formControlName="topic"
                placeholder="What would you like to discuss?"
                class="form-input">
            </div>

            <div class="form-group">
              <label for="message">Message (Optional)</label>
              <textarea
                id="message"
                formControlName="message"
                placeholder="Any additional details..."
                class="form-textarea"
                rows="3">
              </textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" (click)="close()">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="requestForm.invalid || isSubmitting">
                <i class="fas fa-paper-plane" *ngIf="!isSubmitting"></i>
                <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
                {{ isSubmitting ? 'Sending...' : 'Send Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .meeting-request-modal {
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

    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-primary);
    }

    .modal-header h3 i {
      color: var(--primary);
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 0 1.5rem 1.5rem;
    }

    .modal-description {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .cancel-btn {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .submit-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
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

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .cancel-btn, .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class MeetingRequestComponent {
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() requestSubmitted = new EventEmitter<any>();

  requestForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.requestForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      topic: [''],
      message: ['']
    });
  }

  close() {
    this.closeModal.emit();
    this.requestForm.reset();
  }

  submitRequest() {
    if (this.requestForm.valid) {
      this.isSubmitting = true;

      const requestData = {
        ...this.requestForm.value,
        timestamp: new Date(),
        type: 'meeting_request'
      };

      // Simulate API call
      setTimeout(() => {
        this.requestSubmitted.emit(requestData);
        this.toast.success(
          'Request Sent!',
          'Your meeting request has been sent successfully. I\'ll get back to you soon.'
        );
        this.isSubmitting = false;
        this.close();
      }, 1500);
    } else {
      this.toast.error('Validation Error', 'Please fill in all required fields correctly.');
    }
  }
}