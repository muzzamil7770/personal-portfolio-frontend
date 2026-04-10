import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, Contact } from '../services/admin-api.service';
import Swal from 'sweetalert2';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Contacts <span class="badge">{{ contacts.length }}</span></h1>
      </div>

      <div class="loading" *ngIf="loading">Loading...</div>
      <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Subject</th>
              <th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of contacts">
              <td>{{ c.name }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.subject }}</td>
              <td>
                <span class="status" [class]="c.status">{{ c.status }}</span>
              </td>
              <td>{{ c.createdAt | date:'short' }}</td>
              <td class="actions">
                <button class="btn-edit" (click)="openEdit(c.id)">Edit</button>
                <button class="btn-del" (click)="delete(c.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="contacts.length === 0">
              <td colspan="6" class="empty">No contacts found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" *ngIf="editModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Edit Contact</h3>
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
            <label>Subject</label>
            <input [(ngModel)]="form.subject" name="subject" />
          </div>
          <div class="field">
            <label>Message</label>
            <textarea [(ngModel)]="form.message" name="message" rows="4"></textarea>
          </div>
          <div class="field">
            <label>Status</label>
            <select [(ngModel)]="form.status" name="status">
              <option value="unread">unread</option>
              <option value="read">read</option>
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
    .status.unread { background: #fef3c7; color: #92400e; }
    .status.read { background: #d1fae5; color: #065f46; }
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
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  loading = true;
  errorMsg = '';
  editModal = false;
  modalLoading = false;
  form: Partial<Contact> | null = null;
  editId = '';

  constructor(private api: AdminApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getContacts().subscribe({
      next: res => { 
        this.contacts = res.data; 
        this.loading = false;
        this.toast.success('Contacts Loaded', `Successfully loaded ${this.contacts.length} contact(s).`);
      },
      error: (err) => { 
        this.errorMsg = 'Failed to load contacts.'; 
        this.loading = false;
        this.toast.error('Load Failed', err.error?.message || 'Unable to fetch contacts. Please try again.');
      }
    });
  }

  openEdit(id: string) {
    this.editId = id;
    this.editModal = true;
    this.modalLoading = true;
    this.form = null;
    this.cdr.detectChanges();
    this.api.getContactById(id).subscribe({
      next: res => {
        this.form = { ...res.data };
        this.modalLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.modalLoading = false;
        this.closeModal();
        this.cdr.detectChanges();
        this.toast.error('Load Failed', err.error?.message || 'Unable to fetch contact details.');
      }
    });
  }

  async save() {
    if (!this.form) return;
    
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update this contact?',
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
    
    this.api.updateContact(this.editId, this.form).subscribe({
      next: () => { 
        this.closeModal(); 
        this.load();
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Contact updated successfully.',
          confirmButtonColor: '#6366f1',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: err.error?.message || 'Unable to update contact. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    });
  }

  async delete(id: string) {
    const result = await Swal.fire({
      title: 'Delete Contact?',
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
    
    this.api.deleteContact(id).subscribe({
      next: () => { 
        this.load();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Contact has been deleted.',
          confirmButtonColor: '#6366f1',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: err.error?.message || 'Unable to delete contact. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    });
  }

  closeModal() { this.editModal = false; this.form = null; }
}
