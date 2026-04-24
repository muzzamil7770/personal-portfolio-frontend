import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ThemeService, THEMES, AppTheme } from '../../../core/services/theme.service';

interface StatsData {
  watching: number; today: number; thisMonth: number; allTime: number;
  monthlyChart: { month: string; count: number }[];
  recentLogs: { id: string; ip: string; page: string; referrer: string; userAgent: string; date: string; timestamp: string }[];
}

const PROJECTS = [
  {
    name: 'Stepping Stone Therapy | Pathways EHR', icon: 'fas fa-hospital',
    desc: 'Full-featured medical practice management system with appointment scheduling, patient records, and insurance integration.',
    stack: ['Angular 19', 'TypeScript', 'Angular Material', 'Bootstrap 5', 'Firebase', 'Socket.io', 'Chart.js', 'RxJS'],
    methodology: 'Agile / Scrum — 2-week sprints, daily standups, Jira board',
    features: ['Clinician availability & scheduling', 'Patient records & multi-location booking', 'Insurance provider integration', 'OPD appointments & provider management', 'Clinical notes & patient intake', 'Real-time notifications (Socket.io)', 'Analytics dashboards (Chart.js)', 'PDF report generation', 'Multi-language support (i18n)', 'Role-based access control'],
    uiFlow: ['Landing → Login (RBAC)', 'Dashboard → Appointments → Book/Manage', 'Patient Portal → Records → Clinical Notes', 'Admin → Reports → PDF Export'],
    authFlow: ['JWT + Refresh Token', 'Role-based guards (Admin / Clinician / Patient)', 'Firebase Auth for patient portal', 'Session timeout & auto-logout'],
    emailFlow: ['Appointment confirmation → Patient email', 'Reminder 24h before → Nodemailer', 'Insurance claim status → Admin notification']
  },
  {
    name: 'FirstCall | TeleHealth EHR', icon: 'fas fa-phone-alt',
    desc: 'Multi-role healthcare platform with patient management, encounters, analytics, and secure RBAC.',
    stack: ['Angular 19', 'TypeScript', 'Angular Material', 'Bootstrap 5', 'Firebase', 'Chart.js', 'RxJS'],
    methodology: 'Agile / Kanban — continuous delivery, weekly reviews',
    features: ['Patient management & appointments', 'Encounters & analytics modules', 'Role-based access control (RBAC)', 'Custom guards & interceptors', 'Chart.js analytics', 'SweetAlert2 UX', 'Reusable components with form validation'],
    uiFlow: ['Login → Role Detection → Dashboard', 'Patient List → Encounter → Notes', 'Analytics → Charts → Export'],
    authFlow: ['JWT tokens with HTTP interceptor', 'Custom canActivate guards per role', 'Token refresh on 401'],
    emailFlow: ['Encounter summary → Patient email', 'Appointment reminders → Automated scheduler']
  },
  // {
  //   name: 'SNF Wound Care – EMR & Telemedicine', icon: 'fas fa-stethoscope',
  //   desc: 'HIPAA-compliant EMR serving 12,000+ patients across 178 skilled nursing facilities.',
  //   stack: ['React', 'Laravel', 'MySQL', 'Google Cloud', 'HIPAA'],
  //   methodology: 'Waterfall + Agile hybrid — compliance-driven development',
  //   features: ['12,000+ patients across 178 SNFs', 'PointClickCare & MatrixCare integration', 'Video consultation', 'Wound image tracking', 'Encounter notes & progress timeline', 'Secure authentication & RBAC', 'HIPAA data privacy on Google Cloud'],
  //   uiFlow: ['Facility Login → Patient List → Wound Assessment', 'Video Consult → Encounter Notes → Sign-off', 'Admin → Facility Management → Reports'],
  //   authFlow: ['HIPAA-compliant auth', 'Role-based access (Clinician / Admin / Facility)', 'Audit logging for all data access'],
  //   emailFlow: ['Wound assessment reports → Care team', 'Video consult summaries → Patient records', 'Compliance alerts → Admin']
  // }
];

@Component({
  selector: 'app-admin-panel-strip',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="aps-wrapper" (mouseenter)="onEnter()" (mouseleave)="onLeave()">

      <div class="aps-strip" [class.panel-open]="isOpen">
              <span class="aps-strip-label">Admin</span>
      </div>

      <div class="aps-panel" [class.open]="isOpen">
      <div class="aps-panel-header">
        <span class="aps-panel-title"><i class="fas fa-bolt"></i> Portfolio Panel</span>
        <button class="aps-close" (click)="isOpen = false"><i class="fas fa-times"></i></button>
      </div>

      <div class="aps-panel-body">

        <!-- Admin Portal -->
        <div class="aps-section">
          <div class="aps-section-label"><i class="fas fa-shield-alt"></i> Admin Portal</div>
          <button class="aps-admin-btn" (click)="goAdmin()">
            <span>Access Admin Portal</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>

        <!-- Analytics -->
        <div class="aps-section">
          <div class="aps-section-label"><i class="fas fa-chart-line"></i> Real-Time Analytics</div>
          <div class="aps-live-row">
            <span class="aps-live-dot"></span>
            <span class="aps-live-text">{{ liveCount }} {{ liveCount === 1 ? 'person' : 'people' }} watching now</span>
          </div>

          <ng-container *ngIf="isAdmin && stats">
            <div class="aps-stats-grid">
              <div class="aps-stat-card">
                <div class="aps-stat-val">{{ stats.today }}</div>
                <div class="aps-stat-lbl">Today</div>
              </div>
              <div class="aps-stat-card">
                <div class="aps-stat-val">{{ stats.thisMonth }}</div>
                <div class="aps-stat-lbl">This Month</div>
              </div>
              <div class="aps-stat-card">
                <div class="aps-stat-val">{{ stats.allTime }}</div>
                <div class="aps-stat-lbl">All Time</div>
              </div>
            </div>

            <div class="aps-chart" *ngIf="stats.monthlyChart.length">
              <div class="aps-chart-title">Monthly Visits (last 12 months)</div>
              <div class="aps-bars">
                <div class="aps-bar-wrap" *ngFor="let m of stats.monthlyChart">
                  <div class="aps-bar" [style.height.%]="barHeight(m.count)" [title]="m.month + ': ' + m.count"></div>
                  <div class="aps-bar-lbl">{{ m.month.slice(5) }}</div>
                </div>
              </div>
            </div>

            <div class="aps-logs-title">Recent Visitor Logs</div>
            <div class="aps-logs">
              <div class="aps-log-row" *ngFor="let log of stats.recentLogs">
                <div class="aps-log-top">
                  <span class="aps-log-ip">{{ log.ip }}</span>
                  <span class="aps-log-date">{{ log.timestamp | date:'dd MMM, HH:mm' }}</span>
                </div>
                <div class="aps-log-meta">
                  <span class="aps-log-page">{{ log.page }}</span>
                  <span class="aps-log-ref" *ngIf="log.referrer">← {{ log.referrer }}</span>
                </div>
                <div class="aps-log-ua">{{ log.userAgent.slice(0, 60) }}…</div>
              </div>
              <div class="aps-logs-empty" *ngIf="!stats.recentLogs.length">No visits recorded yet.</div>
            </div>
          </ng-container>
        </div>

        <!-- Project Details -->
        <div class="aps-section">
          <div class="aps-section-label"><i class="fas fa-rocket"></i> Project Details</div>
          <div class="aps-projects">
            <div class="aps-project" *ngFor="let p of projects; let i = index">
              <div class="aps-project-header" (click)="toggleProject(i)">
                <span><i [class]="p.icon"></i> {{ p.name }}</span>
                <i class="fas fa-chevron-down aps-chevron" [class.rotated]="openProject === i"></i>
              </div>
              <div class="aps-project-body" *ngIf="openProject === i">
                <p class="aps-proj-desc">{{ p.desc }}</p>

                <div class="aps-proj-block">
                  <div class="aps-proj-block-title"><i class="fas fa-tools"></i> Stack</div>
                  <div class="aps-tags">
                    <span class="aps-tag" *ngFor="let s of p.stack">{{ s }}</span>
                  </div>
                </div>

                <div class="aps-proj-block">
                  <div class="aps-proj-block-title"><i class="fas fa-clipboard-list"></i> Methodology</div>
                  <p class="aps-proj-text">{{ p.methodology }}</p>
                </div>

                <div class="aps-proj-block">
                  <div class="aps-proj-block-title"><i class="fas fa-star"></i> Features</div>
                  <ul class="aps-list">
                    <li *ngFor="let f of p.features">{{ f }}</li>
                  </ul>
                </div>

                <div class="aps-proj-block">
                  <div class="aps-proj-block-title"><i class="fas fa-desktop"></i> UI Flow</div>
                  <ul class="aps-list">
                    <li *ngFor="let step of p.uiFlow">{{ step }}</li>
                  </ul>
                </div>

                <div class="aps-proj-block">
                  <div class="aps-proj-block-title"><i class="fas fa-lock"></i> Auth Flow</div>
                  <ul class="aps-list">
                    <li *ngFor="let a of p.authFlow">{{ a }}</li>
                  </ul>
                </div>

                <div class="aps-proj-block">
                  <div class="aps-proj-block-title"><i class="fas fa-envelope"></i> Email Flow</div>
                  <ul class="aps-list">
                    <li *ngFor="let e of p.emailFlow">{{ e }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Picker -->
        <div class="aps-section">
          <div class="aps-section-label"><i class="fas fa-palette"></i> Theme</div>
          <div class="aps-theme-grid">
            <button
              *ngFor="let t of themes"
              class="aps-theme-chip"
              [class.active]="currentTheme === t.id"
              [title]="t.label"
              (click)="applyTheme(t)">
              <i [class]="t.icon"></i>
              <span>{{ t.label }}</span>
            </button>
          </div>
        </div>

      </div>
      </div>
    </div>
  `,
  styles: [`
    .aps-wrapper {
      position: fixed; bottom: 120px; right: 0; z-index: 1100;
      display: flex; align-items: flex-start;
    }

    .aps-strip {
      background: var(--primary);
      color: #fff; writing-mode: vertical-rl; text-orientation: mixed;
      padding: 14px 8px; border-radius: 10px 0 0 10px;
      cursor: pointer; display: flex; flex-direction: column;
      align-items: center; gap: 6px; flex-shrink: 0;
      box-shadow: -3px 3px 16px var(--primary-200);
      transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
      user-select: none;
    }
    .aps-strip.panel-open {
      opacity: 0; pointer-events: none; transform: translateX(10px);
    }
    .aps-strip-icon { font-size: 1rem; color: #fff; }
    .aps-strip-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; }

    .aps-panel {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: 1100;
      width: 380px; max-width: 95vw;
      background: var(--bg-card); border-left: 1px solid var(--border-color);
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s ease;
      opacity: 0;
      box-shadow: -8px 0 40px rgba(0,0,0,.4);
      pointer-events: none;
    }
    .aps-panel.open {
      transform: translateX(0); opacity: 1; pointer-events: all;
    }

    .aps-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color); flex-shrink: 0;
    }
    .aps-panel-title { color: var(--text-primary); font-weight: 700; font-size: 0.95rem; }
    .aps-close {
      background: var(--primary-100); border: none; color: var(--primary);
      width: 30px; height: 30px; border-radius: 6px; cursor: pointer;
      font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .aps-close:hover { background: #ef4444; color: #fff; }

    .aps-panel-body {
      flex: 1; overflow-y: auto; padding: 1rem;
      display: flex; flex-direction: column; gap: 1rem;
    }
    .aps-panel-body::-webkit-scrollbar { width: 4px; }
    .aps-panel-body::-webkit-scrollbar-track { background: transparent; }
    .aps-panel-body::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 2px; }

    .aps-section {
      background: var(--bg-secondary); border-radius: 10px;
      padding: 1rem; border: 1px solid var(--border-color);
    }
    .aps-section-label {
      color: var(--text-muted); font-size: 0.72rem; font-weight: 700;
      letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.75rem;
    }

    .aps-admin-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      background: var(--primary);
      color: #fff; border: none; padding: 0.75rem 1rem; border-radius: 8px;
      cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: opacity 0.2s;
    }
    .aps-admin-btn:hover { opacity: 0.88; }

    .aps-live-row { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
    .aps-live-dot {
      width: 10px; height: 10px; border-radius: 50%; background: #22c55e;
      box-shadow: 0 0 0 0 rgba(34,197,94,.6); animation: aps-pulse 1.8s infinite;
    }
    @keyframes aps-pulse {
      0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
      70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
    .aps-live-text { color: var(--text-primary); font-size: 0.88rem; font-weight: 600; }

    .aps-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 0.75rem; }
    .aps-stat-card {
      background: var(--bg-tertiary); border-radius: 8px; padding: 0.6rem;
      text-align: center; border: 1px solid var(--border-color);
    }
    .aps-stat-val { color: var(--primary); font-size: 1.3rem; font-weight: 800; }
    .aps-stat-lbl { color: var(--text-muted); font-size: 0.68rem; margin-top: 2px; }

    .aps-chart {
      background: var(--bg-tertiary); border-radius: 8px; padding: 0.75rem;
      border: 1px solid var(--border-color); margin-bottom: 0.75rem;
    }
    .aps-chart-title { color: var(--text-muted); font-size: 0.7rem; margin-bottom: 0.5rem; }
    .aps-bars { display: flex; align-items: flex-end; gap: 4px; height: 60px; }
    .aps-bar-wrap {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 3px; height: 100%; justify-content: flex-end;
    }
    .aps-bar {
      width: 100%; background: var(--primary);
      border-radius: 3px 3px 0 0; min-height: 3px; transition: height 0.3s;
    }
    .aps-bar-lbl { color: var(--text-muted); font-size: 0.55rem; }

    .aps-logs-title {
      color: var(--text-muted); font-size: 0.7rem; font-weight: 700;
      letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem;
    }
    .aps-logs { display: flex; flex-direction: column; gap: 6px; max-height: 260px; overflow-y: auto; }
    .aps-logs::-webkit-scrollbar { width: 3px; }
    .aps-logs::-webkit-scrollbar-thumb { background: var(--primary-200); }
    .aps-log-row {
      background: var(--bg-tertiary); border: 1px solid var(--border-light);
      border-radius: 6px; padding: 0.5rem 0.65rem;
    }
    .aps-log-top { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .aps-log-ip { color: var(--primary); font-size: 0.75rem; font-weight: 600; font-family: monospace; }
    .aps-log-date { color: var(--text-muted); font-size: 0.68rem; }
    .aps-log-meta { display: flex; gap: 8px; margin-bottom: 2px; }
    .aps-log-page { color: #22c55e; font-size: 0.72rem; font-family: monospace; }
    .aps-log-ref { color: var(--text-muted); font-size: 0.68rem; }
    .aps-log-ua { color: var(--text-muted); font-size: 0.65rem; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .aps-logs-empty { color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem; }

    .aps-projects { display: flex; flex-direction: column; gap: 8px; }
    .aps-project { background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
    .aps-project-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.7rem 0.85rem; cursor: pointer; color: var(--text-secondary);
      font-size: 0.82rem; font-weight: 600; transition: background 0.2s;
    }
    .aps-project-header:hover { background: var(--primary-100); color: var(--primary); }
    .aps-chevron { color: var(--text-muted); transition: transform 0.25s; font-size: 0.75rem; }
    .aps-chevron.rotated { transform: rotate(180deg); }
    .aps-project-body { padding: 0 0.85rem 0.85rem; display: flex; flex-direction: column; gap: 0.65rem; }
    .aps-proj-desc { color: var(--text-secondary); font-size: 0.78rem; margin: 0; line-height: 1.5; }
    .aps-proj-block-title {
      color: var(--text-muted); font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 5px;
      display: flex; align-items: center; gap: 5px;
    }
    .aps-proj-block-title i { color: var(--primary); font-size: 0.65rem; }
    .aps-proj-text { color: var(--text-secondary); font-size: 0.78rem; margin: 0; }
    .aps-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .aps-tag {
      background: var(--primary-100); color: var(--primary); border: 1px solid var(--primary-200);
      border-radius: 4px; padding: 2px 7px; font-size: 0.68rem; font-weight: 600;
    }
    .aps-list { margin: 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 3px; }
    .aps-list li { color: var(--text-secondary); font-size: 0.76rem; }

    /* Theme picker */
    .aps-theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .aps-theme-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 8px; border-radius: 7px; border: 1.5px solid var(--border-color);
      background: var(--bg-tertiary); color: var(--text-muted);
      cursor: pointer; font-size: 0.72rem; font-weight: 600;
      transition: all 0.18s; font-family: inherit;
    }
    .aps-theme-chip i { font-size: 0.7rem; }
    .aps-theme-chip:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-100); }
    .aps-theme-chip.active {
      border-color: var(--primary); background: var(--primary);
      color: #fff; box-shadow: 0 2px 8px var(--primary-200);
    }
  `]
})
export class AdminPanelStripComponent implements OnInit, OnDestroy {
  isOpen = false;
  liveCount = 1;
  stats: StatsData | null = null;
  isAdmin = false;
  openProject: number | null = null;
  projects = PROJECTS;
  themes: AppTheme[] = THEMES;
  currentTheme = 'dark';

  private sessionId = '';
  private pollSub?: Subscription;
  private isBrowser: boolean;
  private closeTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.sessionId = sessionStorage.getItem('_vsid') || this.genId();
    sessionStorage.setItem('_vsid', this.sessionId);
    this.checkAdmin();
    this.trackVisit();
    this.fetchLive();
    this.themeService.current$.subscribe(id => this.currentTheme = id);

    this.pollSub = interval(5000).pipe(
      switchMap(() => this.http.get<{ success: boolean; watching: number }>(`${environment.apiUrl}/analytics/live`))
    ).subscribe(r => { if (r.success) this.liveCount = r.watching; });

    interval(30000).subscribe(() => this.sendHeartbeat());
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  private genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  private checkAdmin() {
    const token = localStorage.getItem('admin_token');
    if (!token) { this.isAdmin = false; return; }
    try {
      const p = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = p.exp * 1000 > Date.now() && p.role === 'admin';
    } catch { this.isAdmin = false; }
  }

  private sendHeartbeat() {
    this.http.post(`${environment.apiUrl}/analytics/heartbeat`, {
      sessionId: this.sessionId,
      page: window.location.pathname
    }).subscribe();
  }

  private trackVisit() {
    this.http.post(`${environment.apiUrl}/analytics/track`, {
      sessionId: this.sessionId,
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }).subscribe();
  }

  private fetchLive() {
    this.http.get<{ success: boolean; watching: number }>(`${environment.apiUrl}/analytics/live`)
      .subscribe(r => { if (r.success) this.liveCount = r.watching; });
  }

  onEnter() {
    clearTimeout(this.closeTimer);
    this.isOpen = true;
    this.checkAdmin();
    if (this.isAdmin) this.loadStats();
  }

  onLeave() {
    // 300ms delay so accidental mouse-out doesn't flicker
    this.closeTimer = setTimeout(() => { this.isOpen = false; }, 300);
  }

  applyTheme(t: AppTheme) { this.themeService.setTheme(t.id); }

  goAdmin() { this.isOpen = false; this.router.navigate(['/admin']); }

  toggleProject(i: number) { this.openProject = this.openProject === i ? null : i; }

  private loadStats() {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    this.http.get<{ success: boolean; data: StatsData }>(`${environment.apiUrl}/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(r => { if (r.success) this.stats = r.data; });
  }

  barHeight(count: number): number {
    if (!this.stats?.monthlyChart.length) return 0;
    const max = Math.max(...this.stats.monthlyChart.map(m => m.count));
    return max ? Math.max(8, Math.round((count / max) * 100)) : 8;
  }
}
