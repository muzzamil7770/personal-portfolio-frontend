import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, Hire } from '../services/admin-api.service';
import Swal from 'sweetalert2';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-hires',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Hire Requests <span class="badge">{{ hires.length }}</span></h1>
      </div>

      <div class="loading" *ngIf="loading">Loading...</div>
      <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Budget</th>
              <th>Services</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of hires">
              <td>{{ h.name }}</td>
              <td>{{ h.email }}</td>
              <td>{{ h.budget }}</td>
              <td>{{ h.services || '—' }}</td>
              <td>
                <span class="status" [class]="h.status">{{ h.status }}</span>
              </td>
              <td>{{ h.createdAt | date:'short' }}</td>
              <td class="actions">
                <button class="btn-edit" (click)="openEdit(h.id)">Edit</button>
                <button class="btn-del" (click)="delete(h.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="hires.length === 0">
              <td colspan="7" class="empty">No hire requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" *ngIf="editModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Edit Hire Request</h3>
        <div class="loading" *ngIf="modalLoading">Fetching record...</div>
        <form *ngIf="!modalLoading && form" (ngSubmit)="save()">
          <div class="field">
            <label>Name</label>
            <input [(ngModel)]="form.name" name="name" />
          </div>
          <div class="field">
            <label>Email</label>
            <input [(ngModel)]="form.email" name="email" />
          </div>
          <div class="field">
            <label>Budget</label>
            <input [(ngModel)]="form.budget" name="budget" />
          </div>
          <div class="field">
            <label>Services</label>
            <input [(ngModel)]="form.services" name="services" placeholder="e.g. react-app, web-development" />
          </div>
          <div class="field">
            <label>Message</label>
            <textarea [(ngModel)]="form.message" name="message" rows="4"></textarea>
          </div>
          <div class="field">
            <label>Status</label>
            <select [(ngModel)]="form.status" name="status">
              <option value="pending">pending</option>
              <option value="in-progress">in-progress</option>
              <option value="completed">completed</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { color: var(--text-primary); }
    .page-header { display: flex; align-items: center; margin-bottom: 1.5rem; }
    h1 { font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
    .badge { background: var(--primary); color: #fff; border-radius: 20px; padding: 2px 10px; font-size: 0.8rem; }
    .loading { color: var(--text-muted); padding: 1rem 0; }
    .error-msg { color: #f87171; margin-bottom: 1rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th { background: var(--bg-secondary); color: var(--text-muted); padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); }
    tr:hover td { background: var(--bg-tertiary); }
    .status { padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .status.pending { background: #fef3c7; color: #92400e; }
    .status.in-progress { background: #dbeafe; color: #1e40af; }
    .status.completed { background: #d1fae5; color: #065f46; }
    .status.rejected { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 8px; }
    .btn-edit { background: var(--primary); color: #fff; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: opacity 0.2s; }
    .btn-edit:hover { opacity: 0.85; }
    .btn-del { background: #ef4444; color: #fff; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: opacity 0.2s; }
    .btn-del:hover { opacity: 0.85; }
    .empty { text-align: center; color: var(--text-muted); padding: 2rem; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 2rem; width: 100%; max-width: 480px; box-shadow: var(--shadow-xl); }
    .modal h3 { color: var(--text-primary); margin: 0 0 1.5rem; font-size: 1.2rem; }
    .field { margin-bottom: 1rem; }
    label { display: block; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 5px; font-weight: 600; }
    input, textarea, select {
      width: 100%; padding: 0.6rem 0.8rem; background: var(--bg-input); border: 1px solid var(--border-color);
      border-radius: 8px; color: var(--text-primary); font-size: 0.9rem; box-sizing: border-box; outline: none; font-family: inherit;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-100); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; }
    .btn-cancel { background: none; border: 1px solid var(--border-color); color: var(--text-muted); padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { border-color: var(--primary); color: var(--primary); }
    .btn-save { background: var(--primary); color: #fff; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; }
    .btn-save:hover { opacity: 0.88; }
  `]
})
export class HiresComponent implements OnInit {
  hires: Hire[] = [];
  loading = true;
  errorMsg = '';
  editModal = false;
  modalLoading = false;
  form: Partial<Hire> | null = null;
  editId = '';

  constructor(private api: AdminApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getHires().subscribe({
      next: res => { 
        this.hires = res.data; 
        this.loading = false;
        this.toast.success('Hires Loaded', `Successfully loaded ${this.hires.length} hire request(s).`);
      },
      error: (err) => { 
        this.errorMsg = 'Failed to load hire requests.'; 
        this.loading = false;
        this.toast.error('Load Failed', err.error?.message || 'Unable to fetch hire requests. Please try again.');
      }
    });
  }

  openEdit(id: string) {
    this.editId = id;
    this.editModal = true;
    this.modalLoading = true;
    this.form = null;
    this.cdr.detectChanges();
    this.api.getHireById(id).subscribe({
      next: res => {
        this.form = { ...res.data };
        this.modalLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.modalLoading = false;
        this.closeModal();
        this.cdr.detectChanges();
        this.toast.error('Load Failed', err.error?.message || 'Unable to fetch hire request details.');
      }
    });
  }

  async save() {
    if (!this.form) return;
    
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update this hire request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b'
    });
    
    if (!result.isConfirmed) return;
    
    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    
    this.api.updateHire(this.editId, this.form).subscribe({
      next: () => { 
        this.closeModal(); 
        this.load();
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Hire request updated successfully.',
          confirmButtonColor: '#6366f1',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: err.error?.message || 'Unable to update hire request. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    });
  }

  async delete(id: string) {
    const result = await Swal.fire({
      title: 'Delete Hire Request?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    });
    
    if (!result.isConfirmed) return;
    
    Swal.fire({
      title: 'Deleting...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    
    this.api.deleteHire(id).subscribe({
      next: () => { 
        this.load();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Hire request has been deleted.',
          confirmButtonColor: '#6366f1',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: err.error?.message || 'Unable to delete hire request. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    });
  }

  closeModal() { this.editModal = false; this.form = null; }
}
