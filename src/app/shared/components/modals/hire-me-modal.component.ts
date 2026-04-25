import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UiService } from '../../../core/services/ui.service';
import { ApiService, HireFormData } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-hire-me-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="hire-me-modal" [class.active]="(uiService.hireMeModalOpen$ | async)" (click)="closeOnBackdrop($event)">
      <div class="hire-me-modal-content">
        <div class="hire-me-modal-header">
          <h2 class="hire-me-modal-title">Hire Me For Your Project</h2>
          <button class="hire-me-modal-close" aria-label="Close modal" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="hire-me-modal-body">
          <p style="margin-bottom: 1.5rem; color: var(--text-secondary); line-height: 1.7;">
            Tell me about your project and I'll get back to you within 24 hours with a detailed proposal and timeline.
          </p>

          <div class="hire-services-grid">
            <div class="hire-service-item" 
                 [class.selected]="isSelected('web-development')"
                 (click)="toggleService('web-development')">
              <i class="fas fa-code"></i>
              <span>Web Development</span>
            </div>
            <div class="hire-service-item"
                 [class.selected]="isSelected('angular-app')"
                 (click)="toggleService('angular-app')">
              <i class="fab fa-angular"></i>
              <span>Angular App</span>
            </div>
            <div class="hire-service-item"
                 [class.selected]="isSelected('react-app')"
                 (click)="toggleService('react-app')">
              <i class="fab fa-react"></i>
              <span>React App</span>
            </div>
            <div class="hire-service-item"
                 [class.selected]="isSelected('ui-ux')"
                 (click)="toggleService('ui-ux')">
              <i class="fas fa-paint-brush"></i>
              <span>UI/UX Design</span>
            </div>
            <div class="hire-service-item"
                 [class.selected]="isSelected('consulting')"
                 (click)="toggleService('consulting')">
              <i class="fas fa-comments"></i>
              <span>Consulting</span>
            </div>
            <div class="hire-service-item"
                 [class.selected]="isSelected('performance')"
                 (click)="toggleService('performance')">
              <i class="fas fa-rocket"></i>
              <span>Performance</span>
            </div>
          </div>

          <form class="hire-form" [formGroup]="hireForm" (ngSubmit)="submitForm()">
            <div class="hire-form-group">
              <label for="hire-name" class="hire-form-label">Your Name</label>
              <input type="text" id="hire-name" formControlName="name" class="hire-form-input" [class.is-invalid]="isInvalid('name')" placeholder="Enter your full name" />
              <small class="field-error" *ngIf="isInvalid('name')">
                <span *ngIf="hireForm.get('name')?.errors?.['required']">Name is required.</span>
                <span *ngIf="hireForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters.</span>
              </small>
            </div>

            <div class="hire-form-group">
              <label for="hire-email" class="hire-form-label">Email Address</label>
              <input type="email" id="hire-email" formControlName="email" class="hire-form-input" [class.is-invalid]="isInvalid('email')" placeholder="your.email@example.com" />
              <small class="field-error" *ngIf="isInvalid('email')">
                <span *ngIf="hireForm.get('email')?.errors?.['required']">Email is required.</span>
                <span *ngIf="hireForm.get('email')?.errors?.['email']">Please enter a valid email address.</span>
              </small>
            </div>

            <div class="hire-form-group">
              <label for="hire-budget" class="hire-form-label">Budget Range (Optional)</label>
              <input type="text" id="hire-budget" formControlName="budget" class="hire-form-input" placeholder="$500 - $1000" />
            </div>

            <div class="hire-form-group">
              <label for="hire-message" class="hire-form-label">Project Details</label>
              <textarea id="hire-message" formControlName="message" class="hire-form-input" [class.is-invalid]="isInvalid('message')" placeholder="Tell me about your project, requirements, timeline..."></textarea>
              <small class="field-error" *ngIf="isInvalid('message')">
                <span *ngIf="hireForm.get('message')?.errors?.['required']">Project details are required.</span>
                <span *ngIf="hireForm.get('message')?.errors?.['minlength']">Please provide at least 10 characters.</span>
              </small>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;" [disabled]="hireForm.invalid || isSubmitting">
             <span *ngIf="isSubmitting; else normal">
  <i class="fas fa-spinner fa-spin"></i> Sending...
</span>

<ng-template #normal>
  <i class="fas fa-paper-plane"></i> Send Request
</ng-template>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .field-error { color: var(--error); font-size: 0.78rem; margin-top: 4px; display: block; }
    .is-invalid { border-color: var(--error) !important; }
  `]
})
export class HireMeModalComponent {
  hireForm: FormGroup;
  isSubmitting = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public uiService: UiService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toast: ToastService,
    private notificationService: NotificationService
  ) {
    this.hireForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      budget: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  isSelected(service: string): boolean {
    return this.uiService.getSelectedServices().includes(service);
  }

  toggleService(service: string): void {
    this.uiService.toggleService(service);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.hireForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submitForm(): void {
    if (this.hireForm.invalid) {
      this.hireForm.markAllAsTouched();
      this.toast.error('Invalid Form', 'Please fill in all required fields correctly.');
      this.notificationService.addNotification(
        'Hire Form Error', 
        'Inquiry submission failed due to invalid inputs.', 
        'fas fa-exclamation-triangle', 
        'system', 
        'warning'
      );
      return;
    }

    this.isSubmitting = true;

    const formData: HireFormData = {
      ...this.hireForm.value,
      services: this.uiService.getSelectedServices().join(', ')
    };

    this.apiService.submitHireForm(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.hireForm.reset();
        this.toast.success(
          'Request Sent!',
          "I'll review your project and get back to you within 24 hours."
        );
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toast.error('Failed to Send', err.message || 'Server error');
        this.notificationService.addNotification(
          'Inquiry Failed', 
          `Hire request for "${formData.services}" failed: ${err.message || 'Server error'}`, 
          'fas fa-times-circle', 
          'hire', 
          'error'
        );
      }
    });
  }

  closeModal(): void {
    this.uiService.closeHireMeModal();
  }

  closeOnBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('hire-me-modal')) {
      this.closeModal();
    }
  }
}
