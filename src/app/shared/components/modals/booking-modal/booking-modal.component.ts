import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ApiService, MeetingData } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface BookingData {
  date: Date;
  dateStr: string;
  timeStr: string;
}

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="modal-container glass-morphism">
      <div class="modal-header">
        <h2 mat-dialog-title>Schedule Meeting</h2>
        <p class="summary">
          <i class="fas fa-calendar-day"></i> {{ data.date | date:'fullDate' }} 
          <span class="divider">|</span> 
          <i class="fas fa-clock"></i> {{ data.timeStr }}
        </p>
      </div>

      <mat-dialog-content class="modal-body">
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="John Doe">
              <mat-icon matPrefix><i class="fas fa-user"></i></mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="john@example.com">
              <mat-icon matPrefix><i class="fas fa-envelope"></i></mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Meeting Topic</mat-label>
            <textarea matInput formControlName="topic" placeholder="What would you like to discuss?" rows="4"></textarea>
            <mat-icon matPrefix><i class="fas fa-comment-dots"></i></mat-icon>
          </mat-form-field>

          <div class="privacy-note">
             <i class="fas fa-shield-alt"></i> Your data is secured and will only be used for this meeting.
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="modal-footer">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" class="submit-btn" (click)="onSubmit()" [disabled]="bookingForm.invalid || isSubmitting">
          <span *ngIf="!isSubmitting">Request Meeting 🚀</span>
          <span *ngIf="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Scheduling...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .modal-container { padding: 2rem; color: var(--text-primary); background: transparent; }
    .modal-header { margin-bottom: 2rem; h2 { font-weight: 800; font-size: 1.75rem; margin: 0; color: var(--text-primary); } }
    .summary { color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 10px; margin-top: 8px; font-size: 0.95rem; .divider { opacity: 0.3; } }
    .form-row { display: flex; gap: 1rem; }
    .w-100 { width: 100%; }
    .flex-1 { flex: 1; }
    .privacy-note { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px; margin-top: 0.5rem; opacity: 0.8; }
    ::ng-deep .mat-mdc-form-field-icon-prefix i { font-size: 14px; opacity: 0.6; color: var(--primary); }
    .submit-btn { padding: 0 2rem; height: 48px; border-radius: 12px; font-weight: 700; letter-spacing: 0.5px; background: var(--primary) !important; color: #fff !important; }
  `]
})
export class BookingModalComponent {
  bookingForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingData
  ) {
    this.bookingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      topic: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onCancel() { this.dialogRef.close(); }

  onSubmit() {
    if (this.bookingForm.invalid) return;

    this.isSubmitting = true;
    const meetingData: MeetingData = {
      ...this.bookingForm.value,
      date: this.data.dateStr,
      time: this.data.timeStr
    };

    this.api.scheduleMeeting(meetingData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toast.success('Meeting Requested!', 'Check your email for confirmation.');
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error('Scheduling Failed', err.message || 'Server error');
        this.notification.addNotification('Meeting Error', err.message, 'fas fa-exclamation-circle', 'meeting', 'error');
      }
    });
  }
}
