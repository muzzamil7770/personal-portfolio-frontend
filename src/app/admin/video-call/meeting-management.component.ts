import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MeetingService, ActiveMeeting } from '../../core/services/meeting.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-meeting-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="meeting-management">
      <div class="header-section">
        <div class="header-info">
          <h1><i class="fas fa-video"></i> Meeting Management</h1>
          <p>Create and manage video meetings</p>
        </div>
        <button class="create-btn" (click)="showCreateModal = true">
          <i class="fas fa-plus"></i> New Meeting
        </button>
      </div>

      <!-- Active Meetings -->
      <div class="meetings-section">
        <h2>Active Meetings</h2>
        <div class="meetings-grid" *ngIf="activeMeetings.length > 0; else noMeetings">
          <div class="meeting-card" *ngFor="let meeting of activeMeetings" [class]="meeting.status">
            <div class="meeting-header">
              <h3>{{ meeting.title }}</h3>
              <span class="status-badge" [class]="meeting.status">
                <i class="fas" [class]="getStatusIcon(meeting.status)"></i>
                {{ meeting.status | titlecase }}
              </span>
            </div>

            <div class="meeting-info">
              <div class="info-item">
                <i class="fas fa-users"></i>
                <span>{{ meeting.participants }} participant{{ meeting.participants !== 1 ? 's' : '' }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>{{ meeting.startTime | date:'short' }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-hashtag"></i>
                <span>{{ meeting.roomId }}</span>
              </div>
            </div>

            <div class="meeting-actions">
              <button class="join-btn" (click)="joinMeeting(meeting)">
                <i class="fas fa-sign-in-alt"></i> Join
              </button>
              <button class="copy-btn" (click)="copyMeetingLink(meeting)">
                <i class="fas fa-copy"></i> Copy Link
              </button>
              <button class="end-btn" (click)="endMeeting(meeting)" *ngIf="meeting.status === 'active'">
                <i class="fas fa-stop"></i> End
              </button>
            </div>
          </div>
        </div>

        <ng-template #noMeetings>
          <div class="empty-state">
            <i class="fas fa-video-slash"></i>
            <h3>No Active Meetings</h3>
            <p>Create your first meeting to get started</p>
          </div>
        </ng-template>
      </div>

      <!-- Create Meeting Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeCreateModal()">
        <div class="modal-content glass" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="fas fa-plus"></i> Create New Meeting</h3>
            <button (click)="closeCreateModal()"><i class="fas fa-times"></i></button>
          </div>

          <form [formGroup]="createForm" (ngSubmit)="createMeeting()" class="modal-body">
            <div class="form-group">
              <label for="title">Meeting Title</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="Enter meeting title"
                class="form-input"
                [class.error]="createForm.get('title')?.invalid && createForm.get('title')?.touched">
              <div class="error-msg" *ngIf="createForm.get('title')?.invalid && createForm.get('title')?.touched">
                Meeting title is required
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" (click)="closeCreateModal()">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="createForm.invalid">
                <i class="fas fa-video"></i> Create Meeting
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .meeting-management {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .header-info h1 {
      font-size: 1.8rem;
      color: var(--text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-info h1 i {
      color: var(--primary);
    }

    .header-info p {
      color: var(--text-muted);
      margin: 0.5rem 0 0;
      font-size: 0.9rem;
    }

    .create-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .create-btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .meetings-section h2 {
      font-size: 1.4rem;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .meetings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .meeting-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .meeting-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .meeting-card.active {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
    }

    .meeting-card.waiting {
      border-color: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
    }

    .meeting-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .meeting-header h3 {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin: 0;
      flex: 1;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-badge.active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .status-badge.waiting {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .meeting-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .meeting-actions {
      display: flex;
      gap: 0.5rem;
    }

    .meeting-actions button {
      flex: 1;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      transition: all 0.2s ease;
    }

    .join-btn {
      background: var(--primary);
      color: white;
    }

    .join-btn:hover {
      background: var(--primary-hover);
    }

    .copy-btn {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .copy-btn:hover {
      background: var(--bg-card);
    }

    .end-btn {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .end-btn:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-header button {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
    }

    .modal-header button:hover {
      background: var(--bg-tertiary);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .cancel-btn {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .cancel-btn:hover {
      background: var(--bg-card);
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
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--primary-hover);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .meeting-management {
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .meetings-grid {
        grid-template-columns: 1fr;
      }

      .meeting-actions {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class MeetingManagementComponent implements OnInit, OnDestroy {
  activeMeetings: ActiveMeeting[] = [];
  showCreateModal = false;
  createForm: FormGroup;

  private sub = new Subscription();

  constructor(
    private meetingService: MeetingService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    // If navigated with ?room= query param, redirect to the video call route
    const roomId = this.route.snapshot.queryParamMap.get('room');
    if (roomId) {
      this.router.navigate(['/admin/dashboard/video-call', roomId], { replaceUrl: true });
      return;
    }

    this.sub.add(
      this.meetingService.activeMeetings$.subscribe(meetings => {
        this.activeMeetings = meetings;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  createMeeting() {
    if (this.createForm.valid) {
      const title = this.createForm.value.title;
      const meeting = this.meetingService.createMeeting(title, 'admin'); // In real app, get from auth

      this.toast.success('Meeting Created', `Meeting "${title}" has been created successfully.`);
      this.closeCreateModal();
      this.createForm.reset();

      // Navigate to the meeting
      this.router.navigate(['/admin/dashboard/video-call', meeting.roomId]);
    }
  }

  joinMeeting(meeting: ActiveMeeting) {
    this.router.navigate(['/admin/dashboard/video-call', meeting.roomId]);
  }

  copyMeetingLink(meeting: ActiveMeeting) {
    navigator.clipboard.writeText(meeting.link).then(() => {
      this.toast.success('Link Copied', 'Meeting link has been copied to clipboard.');
    });
  }

  endMeeting(meeting: ActiveMeeting) {
    if (confirm(`Are you sure you want to end the meeting "${meeting.title}"?`)) {
      this.meetingService.endMeeting(meeting.roomId);
      this.toast.success('Meeting Ended', `Meeting "${meeting.title}" has been ended.`);
    }
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.createForm.reset();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'fa-circle';
      case 'waiting': return 'fa-clock';
      case 'ended': return 'fa-stop-circle';
      default: return 'fa-question-circle';
    }
  }
}