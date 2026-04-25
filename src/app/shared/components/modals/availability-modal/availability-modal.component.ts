import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface AvailabilityData {
  date: string;
  existingSlots: string[];
}

@Component({
  selector: 'app-availability-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="modal-container glass-morphism">
      <div class="modal-header">
        <h2 mat-dialog-title>Manage Availability</h2>
        <p class="subtitle">Setting slots for {{ data.date | date:'fullDate' }}</p>
      </div>

      <mat-dialog-content class="modal-body">
        <div class="current-slots" *ngIf="data.existingSlots.length > 0">
          <label>Currently Available:</label>
          <div class="slots-list">
            <span class="slot-badge" *ngFor="let slot of data.existingSlots">
              {{ slot }}
              <i class="fas fa-times" (click)="removeSlot(slot)"></i>
            </span>
          </div>
        </div>

        <form [formGroup]="slotForm" (ngSubmit)="addSlot()">
          <div class="slot-inputs">
            <mat-form-field appearance="outline">
              <mat-label>Start Time</mat-label>
              <input matInput type="time" formControlName="start">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>End Time</mat-label>
              <input matInput type="time" formControlName="end">
            </mat-form-field>

            <button mat-fab color="primary" type="submit" [disabled]="slotForm.invalid" title="Add Slot">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="modal-footer">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="isSaving">
          <span *ngIf="!isSaving">Save Availability</span>
          <span *ngIf="isSaving">Saving...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .modal-container {
      padding: 2rem;
      color: var(--text-primary);
      background: transparent;
    }
    .modal-header {
      margin-bottom: 1.5rem;
      h2 { margin: 0; color: var(--text-primary); font-size: 1.5rem; font-weight: 700; }
      .subtitle { color: var(--text-muted); font-size: 0.9rem; margin: 4px 0 0; }
    }
    .modal-body {
      padding: 1rem 0;
    }
    .current-slots {
      margin-bottom: 2rem;
      label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem; }
    }
    .slots-list {
      display: flex; flex-wrap: wrap; gap: 8px;
    }
    .slot-badge {
      background: var(--primary-100); border: 1px solid var(--primary-200);
      color: var(--primary); padding: 6px 12px; border-radius: 30px; font-size: 0.85rem;
      font-weight: 600; display: flex; align-items: center; gap: 8px;
      i { cursor: pointer; color: #f43f5e; &:hover { color: #ff1f44; } }
    }
    .slot-inputs {
      display: flex; gap: 12px; align-items: center; margin-top: 1rem;
      mat-form-field { flex: 1; }
    }
    ::ng-deep {
      .mat-mdc-dialog-container .mdc-dialog__surface { border-radius: 20px; background: transparent; box-shadow: none; }
      .mat-mdc-form-field-focus-overlay { background-color: var(--primary-50) !important; }
      .mat-mdc-text-field-wrapper { background-color: var(--bg-secondary) !important; }
      .mdc-text-field--outline:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
      .mdc-text-field--outline:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
      .mdc-text-field--outline:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing { border-color: var(--border-color) !important; }
    }
  `]
})
export class AvailabilityModalComponent {
  slotForm: FormGroup;
  isSaving = false;
  currentSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    public dialogRef: MatDialogRef<AvailabilityModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AvailabilityData
  ) {
    this.currentSlots = [...data.existingSlots];
    this.slotForm = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required]
    });
  }

  addSlot() {
    if (this.slotForm.valid) {
      const { start, end } = this.slotForm.value;
      const newSlot = `${start} - ${end}`;
      if (!this.currentSlots.includes(newSlot)) {
        this.currentSlots.push(newSlot);
        this.currentSlots.sort();
      }
      this.slotForm.reset();
    }
  }

  removeSlot(slot: string) {
    this.currentSlots = this.currentSlots.filter(s => s !== slot);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.isSaving = true;
    this.api.setAvailability(this.data.date, this.currentSlots).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          this.toast.success('Availability Updated', `Successfully updated slots for ${this.data.date}`);
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error('Update Failed', err.message || 'Server error');
      }
    });
  }
}
