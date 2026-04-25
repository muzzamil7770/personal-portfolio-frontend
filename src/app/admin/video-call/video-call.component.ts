import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoCallService, Participant } from '../../core/services/video-call.service';
import { MeetingLinkService } from '../../core/services/meeting-link.service';
import { NotepadComponent } from '../../shared/components/notepad/notepad.component';
import { CustomPopupComponent, PopupConfig } from '../../shared/components/custom-popup/custom-popup.component';
import { Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, NotepadComponent, CustomPopupComponent],
  template: `
    <div class="video-module">
      
      <!-- Meeting Link Modal -->
      <div class="modal-overlay" *ngIf="showLinkModal" (click)="closeLinkModal()">
        <div class="modal-content glass" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>🔗 Meeting Link Generated</h3>
            <button (click)="closeLinkModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="link-input-group">
              <input #linkInput type="text" [value]="meetingLink" readonly class="link-input">
              <button (click)="copyLink(linkInput.value)" class="copy-btn">
                📋 Copy
              </button>
            </div>
            <div class="link-info">
              <small>Expires: {{ linkExpiry | date:'short' }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Modal -->
      <div class="modal-overlay" *ngIf="showNotesModal" (click)="closeNotesModal()">
        <div class="modal-content notes-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📝 Participant Notes</h3>
            <button (click)="closeNotesModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="notes-list" *ngIf="selectedParticipantNotes.length > 0; else noNotes">
              <div *ngFor="let participant of selectedParticipantNotes" class="participant-notes-card">
                <div class="participant-header">
                  <span class="participant-name">{{ participant.name }}</span>
                  <span class="notes-indicator" *ngIf="participant.notes">Has Notes ✓</span>
                </div>
                <div class="notes-content" *ngIf="participant.notes; else noNotesText">
                  <pre>{{ participant.notes }}</pre>
                </div>
                <ng-template #noNotesText>
                  <p class="no-notes">No notes from this participant yet.</p>
                </ng-template>
              </div>
            </div>
            <ng-template #noNotes>
              <div class="no-notes-message">
                <i>📭</i>
                <p>No participants have shared notes yet.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Waiting Overlay for Non-Admin Users -->
      <div class="waiting-overlay" *ngIf="!isAdmin && !isAllowed">
        <div class="waiting-card">
          <div class="loader"></div>
          <h2>⏳ Waiting for Admin</h2>
          <p>Please stay on this page. The host will let you in shortly.</p>
          <div class="room-id">Meeting ID: {{ roomId }}</div>
        </div>
      </div>

      <!-- Main Call Container -->
      <div class="call-container" [class.with-sidebar]="isAdmin && sidebarOpen">
        
        <!-- Video Grid Area -->
        <div class="main-video-area">
          <div class="video-grid" [class]="'count-' + (allowedParticipants.length + 1)">
            
            <!-- Local Video -->
            <div class="video-card local-video" [class.muted]="!micEnabled" [class.no-cam]="!camEnabled">
              <video #localVideo autoplay muted playsinline class="video-element"></video>
              <div class="video-overlay">
                <div class="participant-info">
                  <span class="name">You</span>
                  <div class="status-indicators">
                    <i class="fas fa-microphone" [class.muted]="!micEnabled"></i>
                    <i class="fas fa-video" [class.off]="!camEnabled"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Remote Participants -->
            <div *ngFor="let p of allowedParticipants" class="video-card" [class.screen-share]="p.isScreenSharing">
              <video [id]="'video-' + p.id" autoplay playsinline class="video-element"></video>
              <div class="video-overlay">
                <div class="participant-info">
                  <span class="name">{{ p.name }}</span>
                  <div class="status-indicators">
                    <i class="fas fa-microphone" [class.muted]="p.isAudioMuted"></i>
                    <i class="fas fa-video" [class.off]="p.isVideoMuted"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Screen Share Display -->
          <div class="screen-share-container" *ngIf="isScreenSharing">
            <div class="screen-share-header">
              <span>🖥️ Screen Sharing</span>
              <button (click)="toggleScreenShare()" class="stop-share-btn">
                Stop Sharing
              </button>
            </div>
            <div class="screen-share-content">
              <video #screenVideo autoplay playsinline class="screen-video"></video>
            </div>
          </div>

          <!-- Control Bar -->
          <div class="controls-bar">
            <button class="ctrl-btn" (click)="toggleMic()" [class.active]="!micEnabled" title="Toggle Microphone">
              <i class="fas" [class]="micEnabled ? 'fa-microphone' : 'fa-microphone-slash'"></i>
            </button>
            <button class="ctrl-btn" (click)="toggleCam()" [class.active]="!camEnabled" title="Toggle Camera">
              <i class="fas" [class]="camEnabled ? 'fa-video' : 'fa-video-slash'"></i>
            </button>
            <button class="ctrl-btn" (click)="toggleScreenShare()" [class.active]="isScreenSharing" title="Screen Share">
              <i class="fas fa-desktop"></i>
            </button>
            <button class="ctrl-btn" (click)="generateMeetingLink()" *ngIf="isAdmin" title="Generate Link">
              <i class="fas fa-link"></i>
            </button>
            <button class="ctrl-btn" (click)="toggleSidebar()" *ngIf="isAdmin" title="Manage Participants">
              <i class="fas fa-users"></i>
              <span class="badge" *ngIf="pendingParticipants.length > 0">{{ pendingParticipants.length }}</span>
            </button>
            <button class="ctrl-btn end-call" (click)="endCall()" title="End Call">
              <i class="fas fa-phone-slash"></i>
            </button>
          </div>

          <!-- Notepad for Admin -->
          <div class="notepad-container" *ngIf="isAdmin">
            <app-notepad (notesChange)="onNotesChange($event)"></app-notepad>
          </div>
        </div>

        <!-- Management Sidebar for Admin -->
        <aside class="mgmt-sidebar" *ngIf="isAdmin && sidebarOpen">
          <div class="sidebar-header">
            <h3>⚙️ Meeting Management</h3>
            <button (click)="toggleSidebar()">✕</button>
          </div>
          
          <div class="notes-action">
            <button (click)="viewAllNotes()" class="view-notes-btn">
              <i class="fas fa-sticky-note"></i> View All Notes
            </button>
          </div>

          <div class="participant-list">
            <div class="section-label" *ngIf="pendingParticipants.length > 0">🚪 Waiting Room</div>
            <div *ngFor="let p of pendingParticipants" class="p-item pending">
              <div class="p-info">
                <span class="p-name">{{ p.name }}</span>
                <span class="p-status">{{ p.email || 'Waiting for approval' }}</span>
              </div>
              <div class="p-actions">
                <button (click)="allowUser(p)" class="btn-allow" title="Allow">
                  <i class="fas fa-check"></i>
                </button>
                <button (click)="kickUser(p)" class="btn-deny" title="Deny">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="section-label">✅ In Call ({{ allowedParticipants.length }})</div>
            <div *ngFor="let p of allowedParticipants" class="p-item">
              <div class="p-info">
                <span class="p-name">{{ p.name }}</span>
                <span class="p-notes" *ngIf="p.notes">📝 Has notes</span>
              </div>
              <div class="p-actions">
                <button (click)="toggleUserMic(p)" title="Toggle Mic">
                  <i class="fas" [class]="p.isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
                </button>
                <button (click)="kickUser(p)" class="kick" title="Remove">
                  <i class="fas fa-user-minus"></i>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Custom Popup Component -->
      <app-custom-popup
        [isVisible]="showPopup"
        [config]="popupConfig"
        (confirmed)="onPopupConfirmed()"
        (cancelled)="onPopupCancelled()"
        (closed)="onPopupClosed()">
      </app-custom-popup>
    </div>
  `,
  styles: [`
    .video-module { height: calc(100vh - 80px); background: #0f172a; border-radius: 16px; overflow: hidden; position: relative; color: white; }
    .call-container { display: flex; height: 100%; transition: all 0.3s ease; }
    .call-container.with-sidebar { padding-right: 320px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 90%; max-width: 500px; }
    .modal-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .modal-header h3 { margin: 0; display: flex; align-items: center; gap: 0.75rem; }
    .modal-header button { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; border-radius: 8px; font-size: 1.25rem; line-height: 1; }
    .modal-header button:hover { background: rgba(255,255,255,0.05); }
    .modal-body { padding: 1.5rem; }
    .link-input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .link-input { flex: 1; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 0.9rem; }
    .copy-btn { padding: 0.75rem 1rem; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 500; transition: background 0.2s; }
    .copy-btn:hover { background: #2563eb; }
    .link-info { text-align: center; }
    .link-info small { color: #94a3b8; }
    .notes-modal { max-width: 700px; max-height: 80vh; }
    .notes-modal .modal-body { max-height: 60vh; overflow-y: auto; }
    .notes-list { display: flex; flex-direction: column; gap: 1rem; }
    .participant-notes-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05); }
    .participant-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .participant-name { font-weight: 600; font-size: 1.1rem; }
    .notes-indicator { font-size: 0.75rem; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.5rem; border-radius: 12px; }
    .notes-content pre { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; font-size: 0.9rem; }
    .no-notes { color: #94a3b8; font-style: italic; margin: 0; }
    .no-notes-message { text-align: center; padding: 2rem; color: #94a3b8; }
    .no-notes-message i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block; }
    .notes-action { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .view-notes-btn { width: 100%; padding: 0.75rem; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 500; transition: background 0.2s; }
    .view-notes-btn:hover { background: #2563eb; }
    .waiting-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.95); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .waiting-card { text-align: center; padding: 2rem; max-width: 400px; }
    .loader { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    .room-id { margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; font-family: monospace; font-size: 0.9rem; }
    .main-video-area { flex: 1; display: flex; flex-direction: column; }
    .video-grid { flex: 1; display: grid; gap: 1rem; padding: 1rem; }
    .video-grid.count-1 { grid-template-columns: 1fr; }
    .video-grid.count-2 { grid-template-columns: 1fr 1fr; }
    .video-grid.count-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .video-grid.count-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .video-grid.count-5 { grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; }
    .video-grid.count-6 { grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; }
    .video-card { position: relative; background: #1e293b; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; }
    .video-card.local-video { order: -1; }
    .video-card.muted .video-overlay .fa-microphone { color: #ef4444; }
    .video-card.no-cam .video-element { display: none; }
    .video-card.no-cam::after { content: '📷 Camera Off'; position: absolute; inset: 0; background: #374151; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #94a3b8; }
    .video-element { width: 100%; height: 100%; object-fit: cover; }
    .video-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 1rem; }
    .participant-info { display: flex; justify-content: space-between; align-items: center; }
    .participant-info .name { font-weight: 600; font-size: 0.95rem; }
    .status-indicators { display: flex; gap: 0.5rem; }
    .status-indicators i { opacity: 0.9; font-size: 0.9rem; }
    .status-indicators i.muted { color: #ef4444; }
    .status-indicators i.off { color: #6b7280; }
    .screen-share-container { position: absolute; top: 1rem; right: 1rem; width: 300px; background: #1e293b; border-radius: 12px; overflow: hidden; z-index: 10; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .screen-share-header { padding: 0.75rem 1rem; background: #374151; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
    .stop-share-btn { padding: 0.25rem 0.75rem; background: #ef4444; border: none; border-radius: 6px; color: white; font-size: 0.75rem; cursor: pointer; transition: background 0.2s; }
    .stop-share-btn:hover { background: #dc2626; }
    .screen-share-content { aspect-ratio: 16/9; }
    .screen-video { width: 100%; height: 100%; object-fit: contain; background: #0f172a; }
    .controls-bar { display: flex; justify-content: center; gap: 1rem; padding: 1rem; background: rgba(15, 23, 42, 0.95); }
    .ctrl-btn { width: 50px; height: 50px; border-radius: 50%; border: none; background: #374151; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; position: relative; font-size: 1.1rem; }
    .ctrl-btn:hover { background: #4b5563; transform: scale(1.05); }
    .ctrl-btn.active { background: #ef4444; }
    .ctrl-btn.end-call { background: #ef4444; }
    .ctrl-btn.end-call:hover { background: #dc2626; transform: scale(1.1); }
    .ctrl-btn .badge { position: absolute; top: -5px; right: -5px; background: #3b82f6; width: 18px; height: 18px; border-radius: 9px; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .notepad-container { position: absolute; bottom: 100px; right: 1rem; width: 300px; z-index: 10; }
    .mgmt-sidebar { width: 320px; background: #1e293b; border-left: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; position: absolute; right: 0; top: 0; bottom: 0; }
    .sidebar-header { padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
    .sidebar-header h3 { margin: 0; font-size: 1.1rem; }
    .section-label { padding: 1.5rem 1.25rem 0.5rem; font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
    .participant-list { flex: 1; overflow-y: auto; padding-bottom: 2rem; }
    .p-item { margin: 0.5rem 1rem; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
    .p-item.pending { border: 1px solid rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); }
    .p-info { display: flex; flex-direction: column; gap: 2px; }
    .p-name { font-weight: 500; font-size: 0.9rem; }
    .p-status { font-size: 0.75rem; color: #3b82f6; }
    .p-notes { font-size: 0.75rem; color: #10b981; }
    .p-actions { display: flex; gap: 0.4rem; }
    .p-actions button { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 0.85rem; }
    .p-actions button:hover { background: rgba(255,255,255,0.1); }
    .btn-allow { color: #10b981 !important; background: rgba(16, 185, 129, 0.1) !important; }
    .btn-allow:hover { background: rgba(16, 185, 129, 0.2) !important; }
    .btn-deny { color: #f43f5e !important; background: rgba(244, 63, 94, 0.1) !important; }
    .btn-deny:hover { background: rgba(244, 63, 94, 0.2) !important; }
    .kick { color: #f43f5e !important; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 1024px) {
      .call-container.with-sidebar { padding-right: 0; }
      .mgmt-sidebar { width: 100%; max-width: 320px; }
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo') localVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('screenVideo') screenVideoElement?: ElementRef<HTMLVideoElement>;

  // Room & User State
  roomId = '';
  isAdmin = false;
  isAllowed = false;
  sidebarOpen = true;

  // Media Controls
  micEnabled = true;
  camEnabled = true;
  isScreenSharing = false;

  // Meeting Link Modal
  showLinkModal = false;
  meetingLink = '';
  linkExpiry: Date | null = null;

  // Notes Modal
  showNotesModal = false;
  myNotes = '';
  selectedParticipantNotes: { name: string; notes: string }[] = [];

  // Participants
  allParticipants: Participant[] = [];

  // Popup Configuration
  showPopup = false;
  popupConfig: PopupConfig | null = null;
  private pendingAction: (() => void) | null = null;

  // Subscriptions
  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(VideoCallService) private videoCall: VideoCallService,
    @Inject(MeetingLinkService) private meetingLinkService: MeetingLinkService,
    @Inject(ToastService) private toast: ToastService
  ) { }

  // Computed Properties
  get allowedParticipants(): Participant[] {
    return this.allParticipants.filter(p => p.isAllowed);
  }

  get pendingParticipants(): Participant[] {
    return this.allParticipants.filter(p => !p.isAllowed);
  }

  ngOnInit(): void {
    // Subscribe to route params
    this.sub.add(
      this.route.params.subscribe(params => {
        this.roomId = params['room'] || 'general';
        this.isAdmin = this.router.url.includes('/admin');
        if (this.isAdmin) {
          this.isAllowed = true;
        }
        this.initCall();
      })
    );

    // Subscribe to participants stream
    this.sub.add(
      this.videoCall.participants$.subscribe(participants => {
        this.allParticipants = participants;
        // Check if current user was just allowed
        const me = participants.find(p => p.id === this.videoCall.getSocketId());
        if (me?.isAllowed && !this.isAllowed) {
          this.isAllowed = true;
          this.toast.success('Welcome!', 'You have been admitted to the meeting.');
        }
      })
    );

    // Subscribe to screen share stream
    this.sub.add(
      this.videoCall.screenStream$.subscribe(stream => {
        this.isScreenSharing = !!stream;
        if (stream && this.screenVideoElement?.nativeElement) {
          this.screenVideoElement.nativeElement.srcObject = stream;
        }
      })
    );

    // Handle being kicked from call
    this.sub.add(
      this.videoCall.onKicked$.subscribe(() => {
        this.toast.error('Disconnected', 'You have been removed from the call.');
        this.router.navigate(['/']);
      })
    );
  }

  ngAfterViewInit(): void {
    // Attach local video stream to element
    this.sub.add(
      this.videoCall.localStream$.subscribe(stream => {
        if (stream && this.localVideoElement?.nativeElement) {
          this.localVideoElement.nativeElement.srcObject = stream;
        }
      })
    );
  }

  async initCall(): Promise<void> {
    try {
      await this.videoCall.startLocalStream();
      const queryName = this.route.snapshot.queryParamMap.get('name');
      const queryEmail = this.route.snapshot.queryParamMap.get('email');
      const guestName = queryName || 'Guest';
      this.videoCall.joinRoom(this.roomId, this.isAdmin ? 'Admin' : guestName, this.isAdmin, queryEmail || undefined);
      if (!this.isAdmin) {
        this.toast.info('Joining Request Sent', 'Waiting for admin to allow you in.');
      }
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.toast.error('Camera Error', 'Could not access camera/microphone. Please check permissions.');
    }
  }

  // Media Toggle Methods
  toggleMic(): void {
    this.micEnabled = !this.micEnabled;
    this.videoCall.toggleLocalAudio(this.micEnabled);
    this.toast.info(
      this.micEnabled ? 'Microphone On' : 'Microphone Off',
      this.micEnabled ? 'Your microphone is now active' : 'Your microphone is now muted'
    );
  }

  toggleCam(): void {
    this.camEnabled = !this.camEnabled;
    this.videoCall.toggleLocalVideo(this.camEnabled);
    this.toast.info(
      this.camEnabled ? 'Camera On' : 'Camera Off',
      this.camEnabled ? 'Your camera is now active' : 'Your camera is now off'
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  async toggleScreenShare(): Promise<void> {
    if (this.isScreenSharing) {
      // Stop sharing
      this.videoCall.stopScreenShare();
      this.videoCall.stopScreenShareBroadcast(this.roomId);
      this.isScreenSharing = false;
      this.toast.info('Screen sharing stopped', 'You are no longer sharing your screen.');
    } else {
      // Start sharing
      try {
        await this.videoCall.startScreenShare();
        this.videoCall.startScreenShareBroadcast(this.roomId);
        this.toast.success('Screen sharing started', 'Your screen is now being shared.');
      } catch (err: any) {
        console.error('Screen share error:', err);
        this.toast.error('Screen share failed', err?.message || 'Unable to start screen sharing');
      }
    }
  }

  // Meeting Link Methods
  generateMeetingLink(): void {
    const { link, expiresAt } = this.meetingLinkService.generateMeetingLink(this.roomId);
    this.meetingLink = link;
    this.linkExpiry = expiresAt;
    this.showLinkModal = true;
  }

  closeLinkModal(): void {
    this.showLinkModal = false;
  }

  copyLink(link: string): void {
    this.meetingLinkService.copyToClipboard(link).then(() => {
      this.toast.success('Link copied', 'Meeting link has been copied to clipboard.');
    }).catch(() => {
      this.toast.error('Copy failed', 'Unable to copy link. Please copy manually.');
    });
  }

  // Notes Methods
  viewAllNotes(): void {
    this.selectedParticipantNotes = this.allowedParticipants
      .filter(p => p.notes?.trim())
      .map(p => ({
        name: p.name,
        notes: p.notes || ''
      }));
    
    if (this.selectedParticipantNotes.length === 0) {
      this.toast.info('No notes', 'No participants have shared notes yet.');
    }
    this.showNotesModal = true;
  }

  closeNotesModal(): void {
    this.showNotesModal = false;
    this.selectedParticipantNotes = [];
  }

  onNotesChange(notes: string): void {
    this.myNotes = notes;
    this.videoCall.updateNotes(this.roomId, notes);
  }

  // Admin Actions
  allowUser(participant: Participant): void {
    this.videoCall.allowUser(this.roomId, participant.id);
    this.toast.success('User Allowed', `${participant.name} has joined the call.`);
  }

  toggleUserMic(participant: Participant): void {
    const newMutedState = !participant.isAudioMuted;
    this.videoCall.muteUser(this.roomId, participant.id, newMutedState);
    participant.isAudioMuted = newMutedState;
    this.toast.info(
      newMutedState ? `${participant.name} muted` : `${participant.name} unmuted`,
      newMutedState 
        ? `${participant.name}'s microphone has been muted` 
        : `${participant.name}'s microphone has been unmuted`
    );
  }

  kickUser(participant: Participant): void {
    this.popupConfig = {
      title: 'Remove Participant',
      message: `Are you sure you want to remove ${participant.name} from the meeting?`,
      type: 'warning',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      showCancel: true
    };
    this.pendingAction = () => this.confirmKickUser(participant);
    this.showPopup = true;
  }

  private confirmKickUser(participant: Participant): void {
    this.videoCall.kickUser(this.roomId, participant.id);
    this.toast.info('Participant removed', `${participant.name} has been removed from the meeting.`);
  }

  endCall(): void {
    this.popupConfig = {
      title: 'End Meeting',
      message: 'Are you sure you want to end this meeting? All participants will be disconnected.',
      type: 'error',
      confirmText: 'End Meeting',
      cancelText: 'Cancel',
      showCancel: true
    };
    this.pendingAction = () => this.confirmEndCall();
    this.showPopup = true;
  }

  private confirmEndCall(): void {
    if (this.isAdmin) this.videoCall.endMeeting();
    this.videoCall.toggleLocalAudio(false);
    this.videoCall.toggleLocalVideo(false);
    if (this.isScreenSharing) {
      this.videoCall.stopScreenShare();
      this.videoCall.stopScreenShareBroadcast(this.roomId);
    }
    this.router.navigate([this.isAdmin ? '/admin/dashboard' : '/']);
    this.toast.info('Meeting ended', 'The meeting has been closed.');
  }

  // Popup Event Handlers
  onPopupConfirmed(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.closePopup();
  }

  onPopupCancelled(): void {
    this.pendingAction = null;
    this.closePopup();
  }

  onPopupClosed(): void {
    this.pendingAction = null;
    this.closePopup();
  }

  private closePopup(): void {
    this.showPopup = false;
    this.popupConfig = null;
  }

  // Cleanup
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.isAdmin) this.videoCall.endMeeting();
    this.videoCall.toggleLocalAudio(false);
    this.videoCall.toggleLocalVideo(false);
    if (this.isScreenSharing) {
      this.videoCall.stopScreenShare();
      this.videoCall.stopScreenShareBroadcast(this.roomId);
    }
  }
}