import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-join-meeting-banner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <ng-container *ngIf="isLive">
      <button class="live-pill" (click)="showModal = true">
        <span class="live-dot"></span>
        <i class="fas fa-video"></i> Join Live Meeting
      </button>

      <div class="jm-overlay" *ngIf="showModal" (click)="close()">
        <div class="jm-card" (click)="$event.stopPropagation()">
          <div class="jm-header">
            <div class="jm-title">
              <span class="live-dot"></span>
              <h3>Join Live Meeting</h3>
            </div>
            <button class="jm-close" (click)="close()"><i class="fas fa-times"></i></button>
          </div>

          <p class="jm-desc">A live session is in progress. Enter your details to send a join request to the host.</p>

          <form [formGroup]="joinForm" (ngSubmit)="sendRequest()">
            <div class="jm-field">
              <label>Full Name *</label>
              <input type="text" formControlName="name" placeholder="Your full name"
                [class.err]="f['name'].invalid && f['name'].touched">
              <span class="err-msg" *ngIf="f['name'].invalid && f['name'].touched">Name is required (min 2 chars)</span>
            </div>
            <div class="jm-field">
              <label>Email Address *</label>
              <input type="email" formControlName="email" placeholder="your@email.com"
                [class.err]="f['email'].invalid && f['email'].touched">
              <span class="err-msg" *ngIf="f['email'].invalid && f['email'].touched">Valid email is required</span>
            </div>
            <div class="jm-actions">
              <button type="button" class="btn-cancel" (click)="close()">Cancel</button>
              <button type="submit" class="btn-join" [disabled]="joinForm.invalid">
                <i class="fas fa-sign-in-alt"></i> Request to Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .live-pill {
      display: flex; align-items: center; gap: 6px;
      background: rgba(239,68,68,0.12); border: 1.5px solid rgba(239,68,68,0.4);
      color: #ef4444; padding: 6px 14px; border-radius: 20px;
      font-size: 0.8rem; font-weight: 700; cursor: pointer;
      animation: pulse-border 2s infinite; transition: background 0.2s;
      white-space: nowrap;
    }
    .live-pill:hover { background: rgba(239,68,68,0.22); }
    .live-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #ef4444;
      animation: blink 1.2s infinite; flex-shrink: 0;
    }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
    @keyframes pulse-border {
      0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
      50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
    }
    .jm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; backdrop-filter: blur(4px);
    }
    .jm-card {
      background: var(--bg-card); border: 1px solid var(--border-color);
      border-radius: 20px; width: 90%; max-width: 440px; padding: 1.75rem;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .jm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .jm-title { display: flex; align-items: center; gap: 10px; }
    .jm-title h3 { margin: 0; font-size: 1.1rem; color: var(--text-primary); }
    .jm-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 1rem; }
    .jm-close:hover { background: var(--bg-tertiary); }
    .jm-desc { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.5; }
    .jm-field { margin-bottom: 1.1rem; }
    .jm-field label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem; }
    .jm-field input {
      width: 100%; padding: 0.7rem 0.9rem; box-sizing: border-box;
      background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: 8px; color: var(--text-primary); font-size: 0.95rem;
      transition: border-color 0.2s;
    }
    .jm-field input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .jm-field input.err { border-color: #ef4444; }
    .err-msg { color: #ef4444; font-size: 0.75rem; margin-top: 3px; display: block; }
    .jm-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-cancel {
      background: var(--bg-tertiary); border: 1px solid var(--border-color);
      color: var(--text-secondary); padding: 0.65rem 1.25rem;
      border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem;
    }
    .btn-join {
      background: #ef4444; border: none; color: white;
      padding: 0.65rem 1.4rem; border-radius: 8px;
      cursor: pointer; font-weight: 700; font-size: 0.875rem;
      display: flex; align-items: center; gap: 6px; transition: background 0.2s;
    }
    .btn-join:hover:not(:disabled) { background: #dc2626; }
    .btn-join:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class JoinMeetingBannerComponent implements OnInit, OnDestroy {
  isLive = false;
  showModal = false;
  roomId: string | null = null;
  joinForm: FormGroup;
  private sub = new Subscription();

  constructor(
    private socketService: SocketService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.joinForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.joinForm.controls; }

  ngOnInit() {
    this.sub.add(
      this.socketService.liveMeeting$.subscribe(state => {
        this.isLive = state.active;
        this.roomId = state.roomId;
        if (!state.active) this.showModal = false;
      })
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  close() {
    this.showModal = false;
    this.joinForm.reset();
  }

  sendRequest() {
    if (this.joinForm.invalid || !this.roomId) return;
    const { name, email } = this.joinForm.value;
    this.close();
    this.router.navigate(['/video-call', this.roomId], {
      queryParams: { name, email }
    });
  }
}
