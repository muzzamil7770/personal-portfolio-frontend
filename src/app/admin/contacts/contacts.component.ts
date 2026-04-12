import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, Contact } from '../services/admin-api.service';
import Swal from 'sweetalert2';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>
          <i class="fas fa-envelope"></i>
          Contacts <span class="badge">{{ contacts.length }}</span>
        </h1>
      </div>
      <div class="error-msg" *ngIf="errorMsg">
        <i class="fas fa-exclamation-circle"></i> {{ errorMsg }}
      </div>

      <!-- Skeleton -->
      <app-skeleton *ngIf="loading" variant="table" [rows]="5" [cols]="6"></app-skeleton>

      <!-- Table -->
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
              <td class="td-name">{{ c.name }}</td>
              <td class="td-email">{{ c.email }}</td>
              <td class="td-subject">{{ c.subject }}</td>
              <td>
                <div class="status-wrap">
                  <span class="status" [class]="c.status">{{ c.status }}</span>
                  <div class="status-actions">
                    <button class="sa-btn sa-ok" title="Mark as read" (click)="quickStatus(c, 'read')">
                      <i class="fas fa-check"></i>
                    </button>
                    <button class="sa-btn sa-no" title="Mark as unread" (click)="quickStatus(c, 'unread')">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="td-date">{{ c.createdAt | date:'dd MMM yy' }}</td>
              <td class="actions">
                <button class="btn-view" (click)="openView(c.id)">
                  <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-del" (click)="delete(c.id)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="contacts.length === 0">
              <td colspan="6" class="empty">
                <i class="fas fa-inbox"></i> No contacts found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Backdrop -->
    <div class="md-backdrop" *ngIf="dialogOpen" (click)="closeDialog()"></div>

    <!-- Dialog -->
    <div class="md-dialog" *ngIf="dialogOpen" role="dialog" aria-modal="true">
      <div class="md-dialog-header">
        <div class="md-dialog-title-wrap">
          <div class="md-dialog-icon-wrap">
            <i class="fas fa-envelope"></i>
          </div>
          <div>
            <div class="md-dialog-title">{{ editMode ? 'Edit Contact' : 'Contact Details' }}</div>
            <div class="md-dialog-subtitle" *ngIf="form">{{ form.name }} &middot; {{ form.email }}</div>
          </div>
        </div>
        <div class="md-header-actions">
          <button class="md-mode-btn" *ngIf="!editMode" (click)="editMode = true">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="md-mode-btn md-mode-view" *ngIf="editMode" (click)="editMode = false">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="md-close-btn" (click)="closeDialog()" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Dialog skeleton while fetching -->
      <app-skeleton *ngIf="modalLoading" variant="dialog" [rows]="4"></app-skeleton>

      <!-- VIEW MODE -->
      <div class="md-view-body" *ngIf="!modalLoading && form && !editMode">
        <div class="vf-row">
          <div class="vf-item">
            <span class="vf-label"><i class="fas fa-user"></i> Name</span>
            <span class="vf-val">{{ form.name }}</span>
          </div>
          <div class="vf-item">
            <span class="vf-label"><i class="fas fa-at"></i> Email</span>
            <span class="vf-val vf-link">{{ form.email }}</span>
          </div>
        </div>
        <div class="vf-item">
          <span class="vf-label"><i class="fas fa-tag"></i> Subject</span>
          <span class="vf-val">{{ form.subject }}</span>
        </div>
        <div class="vf-item">
          <span class="vf-label"><i class="fas fa-circle-dot"></i> Status</span>
          <span class="status" [class]="form.status">{{ form.status }}</span>
        </div>
        <div class="vf-item vf-msg">
          <span class="vf-label"><i class="fas fa-comment-alt"></i> Message</span>
          <p class="vf-message">{{ form.message }}</p>
        </div>
        <div class="md-dialog-actions">
          <button class="md-btn-ghost" (click)="closeDialog()">
            <i class="fas fa-times"></i> Close
          </button>
          <button class="md-btn-primary" (click)="editMode = true">
            <i class="fas fa-pen"></i> Edit
          </button>
        </div>
      </div>

      <!-- EDIT MODE -->
      <form class="md-dialog-body" *ngIf="!modalLoading && form && editMode" (ngSubmit)="save()">
        <div class="md-field">
          <label class="md-label">Name</label>
          <input class="md-input" [(ngModel)]="form.name" name="name" />
        </div>
        <div class="md-field">
          <label class="md-label">Email</label>
          <input class="md-input" [(ngModel)]="form.email" name="email" type="email" />
        </div>
        <div class="md-field">
          <label class="md-label">Subject</label>
          <input class="md-input" [(ngModel)]="form.subject" name="subject" />
        </div>
        <div class="md-field">
          <label class="md-label">Message</label>
          <textarea class="md-input md-textarea" [(ngModel)]="form.message" name="message" rows="4"></textarea>
        </div>
        <div class="md-field">
          <label class="md-label">Status</label>
          <div class="md-select-wrap">
            <select class="md-input md-select" [(ngModel)]="form.status" name="status">
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <i class="fas fa-chevron-down md-select-arrow"></i>
          </div>
        </div>
        <div class="md-dialog-actions">
          <button type="button" class="md-btn-ghost" (click)="editMode = false">
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <button type="submit" class="md-btn-primary">
            <i class="fas fa-check"></i> Save Changes
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { color: var(--text-primary); }
    .page-header { display: flex; align-items: center; margin-bottom: 1.5rem; }
    h1 { font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
    h1 i { color: var(--primary); }
    .badge { background: var(--primary); color: #fff; border-radius: 20px; padding: 2px 10px; font-size: 0.8rem; }
    .error-msg { color: #f87171; margin-bottom: 1rem; display: flex; align-items: center; gap: 6px; }

    .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; min-width: 600px; }
    th { background: var(--bg-secondary); color: var(--text-muted); padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); white-space: nowrap; font-size: 0.8rem; font-weight: 600; }
    td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg-tertiary); }
    .td-name { font-weight: 600; color: var(--text-primary); white-space: nowrap; }
    .td-email { color: var(--primary); font-size: 0.82rem; }
    .td-subject { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .td-date { white-space: nowrap; font-size: 0.8rem; }

    /* Status hover quick-actions */
    .status-wrap { position: relative; display: inline-flex; align-items: center; gap: 6px; }
    .status { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
    .status.unread { background: #fef3c7; color: #92400e; }
    .status.read { background: #d1fae5; color: #065f46; }
    .status-actions {
      display: none; align-items: center; gap: 3px;
      position: absolute; left: 100%; top: 50%; transform: translateY(-50%);
      margin-left: 6px; background: var(--bg-card);
      border: 1px solid var(--border-color); border-radius: 8px;
      padding: 3px; box-shadow: var(--shadow-md); z-index: 10;
    }
    .status-wrap:hover .status-actions { display: flex; }
    .sa-btn {
      width: 26px; height: 26px; border: none; border-radius: 5px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; font-size: 0.7rem;
    }
    .sa-ok { background: rgba(34,197,94,0.15); color: #22c55e; }
    .sa-ok:hover { background: #22c55e; color: #fff; }
    .sa-no { background: rgba(239,68,68,0.12); color: #ef4444; }
    .sa-no:hover { background: #ef4444; color: #fff; }

    .actions { display: flex; gap: 6px; align-items: center; }
    .btn-view {
      display: flex; align-items: center; gap: 5px;
      background: var(--primary); color: #fff; border: none;
      padding: 5px 12px; border-radius: 6px; cursor: pointer;
      font-size: 0.78rem; font-weight: 600; transition: opacity 0.2s;
    }
    .btn-view:hover { opacity: 0.85; }
    .btn-del {
      width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
      background: rgba(239,68,68,0.1); color: #ef4444;
      border: 1px solid rgba(239,68,68,0.2); border-radius: 6px;
      cursor: pointer; font-size: 0.78rem; transition: all 0.2s;
    }
    .btn-del:hover { background: #ef4444; color: #fff; }
    .empty { text-align: center; color: var(--text-muted); padding: 2rem; display: flex; align-items: center; justify-content: center; gap: 8px; }

    /* Material Dialog */
    .md-backdrop {
      position: fixed; inset: 0; z-index: 9998;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
      animation: md-fade-in 0.2s ease;
    }
    .md-dialog {
      position: fixed; top: 50%; left: 50%; z-index: 9999;
      transform: translate(-50%, -50%);
      width: min(520px, 95vw); max-height: 90vh; overflow-y: auto;
      background: var(--bg-card); border: 1px solid var(--border-color);
      border-radius: 16px; box-shadow: 0 24px 64px rgba(0,0,0,0.45);
      animation: md-slide-in 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .md-dialog::-webkit-scrollbar { width: 4px; }
    .md-dialog::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 4px; }
    @keyframes md-fade-in { from { opacity:0; } to { opacity:1; } }
    @keyframes md-slide-in {
      from { opacity:0; transform:translate(-50%,calc(-50% + 20px)) scale(0.96); }
      to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
    }

    .md-dialog-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1.25rem 1rem; border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary); border-radius: 16px 16px 0 0;
      position: sticky; top: 0; z-index: 2;
    }
    .md-dialog-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .md-dialog-icon-wrap {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--primary-100); border: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: center;
      color: var(--primary); font-size: 1rem; flex-shrink: 0;
    }
    .md-dialog-title { color: var(--text-primary); font-size: 1rem; font-weight: 700; }
    .md-dialog-subtitle { color: var(--text-muted); font-size: 0.75rem; margin-top: 1px; }
    .md-header-actions { display: flex; align-items: center; gap: 6px; }
    .md-mode-btn {
      display: flex; align-items: center; gap: 5px;
      background: var(--primary-100); border: 1px solid var(--border-color);
      color: var(--primary); padding: 5px 10px; border-radius: 7px;
      cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.2s;
    }
    .md-mode-btn:hover { background: var(--primary); color: #fff; }
    .md-mode-view { background: var(--bg-tertiary); color: var(--text-muted); border-color: var(--border-color); }
    .md-mode-view:hover { background: var(--bg-secondary); color: var(--text-primary); }
    .md-close-btn {
      width: 30px; height: 30px; border-radius: 7px; border: none;
      background: var(--bg-tertiary); color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; font-size: 0.85rem;
    }
    .md-close-btn:hover { background: #ef4444; color: #fff; }

    /* View mode */
    .md-view-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .vf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media(max-width:480px) { .vf-row { grid-template-columns: 1fr; } }
    .vf-item { display: flex; flex-direction: column; gap: 5px; }
    .vf-label {
      font-size: 0.7rem; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
      display: flex; align-items: center; gap: 5px;
    }
    .vf-label i { font-size: 0.65rem; color: var(--primary); }
    .vf-val { color: var(--text-primary); font-size: 0.9rem; }
    .vf-link { color: var(--primary); }
    .vf-msg { gap: 6px; }
    .vf-message {
      color: var(--text-secondary); font-size: 0.875rem; line-height: 1.65;
      background: var(--bg-secondary); border: 1px solid var(--border-light);
      border-radius: 8px; padding: 0.75rem; margin: 0;
    }

    /* Edit mode */
    .md-dialog-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }
    .md-field { display: flex; flex-direction: column; gap: 4px; }
    .md-label { color: var(--text-muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
    .md-input {
      width: 100%; padding: 0.6rem 0.85rem;
      background: var(--bg-input); border: 1.5px solid var(--border-color);
      border-radius: 8px; color: var(--text-primary); font-size: 0.875rem;
      box-sizing: border-box; outline: none; font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .md-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-100); }
    .md-textarea { resize: vertical; min-height: 90px; }
    .md-select-wrap { position: relative; }
    .md-select { appearance: none; padding-right: 2rem; cursor: pointer; }
    .md-select-arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; font-size: 0.7rem; }

    .md-dialog-actions {
      display: flex; justify-content: flex-end; gap: 8px;
      padding-top: 0.75rem; border-top: 1px solid var(--border-light); margin-top: 0.25rem;
    }
    .md-btn-ghost {
      display: flex; align-items: center; gap: 5px;
      background: none; border: 1.5px solid var(--border-color); color: var(--text-muted);
      padding: 0.5rem 1.1rem; border-radius: 8px; cursor: pointer;
      font-size: 0.85rem; font-family: inherit; transition: all 0.2s;
    }
    .md-btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
    .md-btn-primary {
      display: flex; align-items: center; gap: 5px;
      background: var(--primary); color: #fff; border: none;
      padding: 0.5rem 1.1rem; border-radius: 8px; cursor: pointer;
      font-size: 0.85rem; font-weight: 600; font-family: inherit;
      transition: opacity 0.2s, transform 0.15s;
    }
    .md-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  `]
})
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  loading = true;
  errorMsg = '';
  dialogOpen = false;
  editMode = false;
  modalLoading = false;
  form: Partial<Contact> | null = null;
  editId = '';

  constructor(private api: AdminApiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getContacts().subscribe({
      next: res => { this.contacts = res.data; this.loading = false; },
      error: () => { this.errorMsg = 'Failed to load contacts.'; this.loading = false; }
    });
  }

  openView(id: string) {
    this.editId = id;
    this.dialogOpen = true;
    this.editMode = false;
    this.modalLoading = true;
    this.form = null;
    this.cdr.detectChanges();
    this.api.getContactById(id).subscribe({
      next: res => { this.form = { ...res.data }; this.modalLoading = false; this.cdr.detectChanges(); },
      error: () => { this.modalLoading = false; this.closeDialog(); this.cdr.detectChanges(); }
    });
  }

  quickStatus(c: Contact, status: string) {
    this.api.updateContact(c.id, { status } as any).subscribe({
      next: () => { c.status = status; this.toast.success('Updated', `Marked as ${status}.`); },
      error: () => this.toast.error('Failed', 'Could not update status.')
    });
  }

  async save() {
    if (!this.form) return;
    const { id, createdAt, ...payload } = this.form as any;
    const result = await Swal.fire({
      title: 'Save Changes?', icon: 'question', showCancelButton: true,
      confirmButtonText: 'Save', confirmButtonColor: '#00aedc',
      cancelButtonColor: '#64748b', background: '#0f151a', color: '#ffffff'
    });
    if (!result.isConfirmed) return;
    this.api.updateContact(this.editId, payload).subscribe({
      next: () => { this.closeDialog(); this.load(); this.toast.success('Saved!', 'Contact updated.'); },
      error: (err) => this.toast.error('Save Failed', err.error?.message || 'Unable to update.')
    });
  }

  async delete(id: string) {
    const result = await Swal.fire({
      title: 'Delete Contact?', text: 'This cannot be undone!', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
      background: '#0f151a', color: '#ffffff'
    });
    if (!result.isConfirmed) return;
    this.api.deleteContact(id).subscribe({
      next: () => { this.load(); this.toast.success('Deleted!', 'Contact removed.'); },
      error: (err) => this.toast.error('Delete Failed', err.error?.message || 'Unable to delete.')
    });
  }

  closeDialog() { this.dialogOpen = false; this.form = null; this.editMode = false; }
}
