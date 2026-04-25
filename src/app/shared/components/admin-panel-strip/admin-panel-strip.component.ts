import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService, AppTheme, THEMES } from '../../../core/services/theme.service';
import { SocketService } from '../../../core/services/socket.service';
import { environment } from '../../../../environments/environment';
import { CookieService } from '../../../core/services/cookie.service';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { HealthService, SystemHealth } from '../../../core/services/health.service';

interface StatsData {
  watching: number; today: number; thisMonth: number; allTime: number;
  monthlyChart: { month: string; count: number }[];
  recentLogs: { id: string; ip: string; page: string; referrer: string; userAgent: string; date: string; timestamp: string }[];
}


interface HistoryResponse {
  success: boolean;
  data: any[];
}

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  icon: string;
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
  }
];

@Component({
  selector: 'app-admin-panel-strip',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <!-- Toast Container -->
    <div class="aps-toasts">
      <div class="aps-toast" *ngFor="let t of toasts" [class]="'toast-' + t.type">
        <i [class]="t.icon"></i>
        <div class="aps-toast-body">
          <div class="aps-toast-title">{{ t.title }}</div>
          <div class="aps-toast-msg">{{ t.message }}</div>
        </div>
        <button class="aps-toast-close" (click)="dismissToast(t.id)"><i class="fas fa-times"></i></button>
      </div>
    </div>

    <div class="aps-wrapper" (mouseenter)="onEnterDesktop()" (mouseleave)="onLeaveDesktop()">

      <div class="aps-strip" [class.panel-open]="isOpen" (click)="toggleMobile()">
          <div class="aps-noti-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</div>
          <span class="aps-strip-label">Admin</span>
      </div>

      <div class="aps-panel" [class.open]="isOpen">
      <div class="aps-panel-header">
        <span class="aps-panel-title"><i class="fas fa-bolt"></i> Portfolio Panel</span>
        <div class="aps-header-actions">
           <div class="aps-noti-trigger" (click)="showNotifications = !showNotifications">
             <i class="fas fa-bell"></i>
             <span class="aps-dot" *ngIf="unreadCount > 0"></span>
           </div>
           <button class="aps-close" (click)="isOpen = false"><i class="fas fa-times"></i></button>
        </div>
      </div>

      <div class="aps-panel-body">

        <!-- Notifications Dropdown -->
        <div class="aps-notifications-panel" *ngIf="showNotifications">
           <div class="aps-noti-header">
             <span>Notifications</span>
             <button (click)="markAllAsRead()">Clear All</button>
           </div>
            <div class="aps-noti-tabs">
              <button [class.active]="notiFilter === 'all'" (click)="notiFilter = 'all'">All</button>
              <button [class.active]="notiFilter === 'request'" (click)="notiFilter = 'request'">Requests</button>
              <button [class.active]="notiFilter === 'system'" (click)="notiFilter = 'system'">System</button>
            </div>
            <div class="aps-noti-list">
              <div class="aps-noti-item" *ngFor="let n of filteredNotifications" [class.unread]="!n.isRead" [class.noti-success]="n.status === 'success'">
                <div class="aps-noti-icon"><i [class]="n.icon"></i></div>
                <div class="aps-noti-content">
                  <div class="aps-noti-title">{{ n.title }}</div>
                  <div class="aps-noti-msg">{{ n.message }}</div>
                  <div class="aps-noti-time">
                    <span>{{ n.time | date:'shortTime' }}</span>
                    <span class="aps-noti-type" *ngIf="n.type">{{ n.type }}</span>
                  </div>
                </div>
              </div>
              <div class="aps-noti-empty" *ngIf="!filteredNotifications.length">No matching notifications</div>
            </div>
        </div>

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

          <!-- Connection Status -->
          <div class="aps-health-bar" *ngIf="health">
            <div class="aps-health-item" title="Firebase">
              <span class="aps-dot" [class]="health.firebase"></span>
              <span>Firebase</span>
            </div>
            <div class="aps-health-item" title="Server API">
              <span class="aps-dot" [class]="health.api"></span>
              <span>Server API</span>
            </div>
            <div class="aps-health-item" title="Socket">
              <span class="aps-dot" [class]="health.socket"></span>
              <span>Socket</span>
            </div>
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
    /* ── Toasts ────────────────────────────────────────────────── */
    .aps-toasts {
      position: fixed; bottom: 24px; left: 24px; z-index: 9999;
      display: flex; flex-direction: column-reverse; gap: 10px;
      max-width: 340px; pointer-events: none;
    }
    .aps-toast {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; border-radius: 12px;
      background: var(--bg-card); border: 1px solid var(--border-color);
      box-shadow: 0 8px 30px rgba(0,0,0,.35);
      animation: toast-in 0.35s cubic-bezier(.4,0,.2,1) forwards;
      pointer-events: all;
    }
    .aps-toast i:first-child { font-size: 1rem; margin-top: 2px; flex-shrink: 0; }
    .toast-success { border-left: 3px solid #22c55e; } .toast-success i:first-child { color: #22c55e; }
    .toast-error   { border-left: 3px solid #ef4444; } .toast-error   i:first-child { color: #ef4444; }
    .toast-info    { border-left: 3px solid var(--primary); } .toast-info    i:first-child { color: var(--primary); }
    .toast-warning { border-left: 3px solid #f59e0b; } .toast-warning i:first-child { color: #f59e0b; }
    .aps-toast-title { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }
    .aps-toast-msg   { font-size: 0.73rem; color: var(--text-secondary); margin-top: 2px; line-height: 1.4; }
    .aps-toast-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; margin-left: auto; font-size: 0.7rem; }
    @keyframes toast-in { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

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
      user-select: none; position: relative;
    }
    .aps-noti-badge {
      position: absolute; top: -8px; left: -8px; width: 18px; height: 18px;
      background: #ef4444; color: white; border-radius: 50%;
      font-size: 0.6rem; font-weight: 800; display: flex;
      align-items: center; justify-content: center; writing-mode: horizontal-tb;
    }
    .aps-strip.panel-open { opacity: 0; pointer-events: none; transform: translateX(10px); }
    .aps-strip-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; }

    .aps-panel {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: 1100;
      width: 380px; max-width: 95vw;
      background: var(--bg-card); border-left: 1px solid var(--border-color);
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s ease;
      opacity: 0; box-shadow: -8px 0 40px rgba(0,0,0,.4);
      pointer-events: none;
    }
    .aps-panel.open { transform: translateX(0); opacity: 1; pointer-events: all; }

    .aps-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color); flex-shrink: 0;
    }
    .aps-header-actions { display: flex; align-items: center; gap: 1rem; }
    .aps-noti-trigger {
       position: relative; color: var(--text-muted); cursor: pointer;
       font-size: 1.1rem; transition: color 0.2s;
    }
    .aps-noti-trigger:hover { color: var(--primary); }
    .aps-noti-trigger .aps-dot {
       position: absolute; top: -2px; right: -2px; width: 8px; height: 8px;
       background: #ef4444; border-radius: 50%; border: 2px solid var(--bg-secondary);
    }
    .aps-panel-title { color: var(--text-primary); font-weight: 700; font-size: 0.95rem; }
    .aps-close {
      background: var(--primary-100); border: none; color: var(--primary);
      width: 30px; height: 30px; border-radius: 6px; cursor: pointer;
      font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .aps-close:hover { background: var(--error); color: #fff; }

    .aps-panel-body {
      flex: 1; overflow-y: auto; padding: 1rem;
      display: flex; flex-direction: column; gap: 1rem; position: relative;
    }
    .aps-panel-body::-webkit-scrollbar { width: 4px; }
    .aps-panel-body::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 2px; }

    /* Notifications Panel */
    .aps-notifications-panel {
       position: absolute; top: 0; left: 0; right: 0; bottom: 0;
       background: var(--bg-card); z-index: 10; padding: 1rem;
       display: flex; flex-direction: column; animation: slideIn 0.3s ease;
    }
    @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .aps-noti-header {
       display: flex; justify-content: space-between; align-items: center;
       margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);
    }
    .aps-noti-header span { font-weight: 700; color: var(--text-primary); }
    .aps-noti-header button { background: none; border: none; color: var(--primary); font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .aps-noti-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .aps-noti-item {
       display: flex; gap: 1rem; padding: 0.85rem; border-radius: 10px;
       background: var(--bg-tertiary); border: 1px solid var(--border-color);
       transition: transform 0.2s;
    }
    .aps-noti-item.unread { border-left: 3px solid var(--primary); background: var(--primary-100); }
    .aps-noti-icon {
       width: 35px; height: 35px; border-radius: 50%; background: var(--primary-100);
       color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0;
    }
    .aps-noti-title { font-weight: 700; color: var(--text-primary); font-size: 0.82rem; margin-bottom: 2px; }
    .aps-noti-msg { color: var(--text-secondary); font-size: 0.75rem; line-height: 1.4; margin-bottom: 4px; }
    .aps-noti-time { display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.65rem; font-weight: 600; }
    .aps-noti-type { background: var(--bg-card); padding: 1px 6px; border-radius: 4px; font-size: 0.6rem; text-transform: uppercase; }
    .aps-noti-tabs { display: flex; gap: 4px; margin-bottom: 0.75rem; background: var(--bg-tertiary); padding: 4px; border-radius: 8px; }
    .aps-noti-tabs button { flex: 1; background: none; border: none; color: var(--text-muted); font-size: 0.7rem; font-weight: 600; padding: 5px; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
    .aps-noti-tabs button.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
    .aps-noti-item.noti-success { border-left-color: var(--success); }
    .aps-noti-empty { text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.85rem; }

    .aps-section { background: var(--bg-secondary); border-radius: 10px; padding: 1rem; border: 1px solid var(--border-color); }
    .aps-section-label { color: var(--text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.75rem; }
    .aps-admin-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--primary); color: #fff; border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: opacity 0.2s; }
    .aps-admin-btn:hover { opacity: 0.88; }
    .aps-live-row { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
    .aps-live-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 0 rgba(34,197,94,.6); animation: aps-pulse 1.8s infinite; }
    @keyframes aps-pulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); } 70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
    .aps-live-text { color: var(--text-primary); font-size: 0.88rem; font-weight: 600; }
    .aps-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 0.75rem; }
    .aps-stat-card { background: var(--bg-tertiary); border-radius: 8px; padding: 0.6rem; text-align: center; border: 1px solid var(--border-color); }
    .aps-stat-val { color: var(--primary); font-size: 1.3rem; font-weight: 800; }
    .aps-stat-lbl { color: var(--text-muted); font-size: 0.68rem; margin-top: 2px; }
    .aps-chart { background: var(--bg-tertiary); border-radius: 8px; padding: 0.75rem; border: 1px solid var(--border-color); margin-bottom: 0.75rem; }
    .aps-chart-title { color: var(--text-muted); font-size: 0.7rem; margin-bottom: 0.5rem; }
    .aps-bars { display: flex; align-items: flex-end; gap: 4px; height: 60px; }
    .aps-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; height: 100%; justify-content: flex-end; }
    .aps-bar { width: 100%; background: var(--primary); border-radius: 3px 3px 0 0; min-height: 3px; transition: height 0.3s; }
    .aps-bar-lbl { color: var(--text-muted); font-size: 0.55rem; }

    /* Health Styles */
    .aps-health-bar {
      display: flex; justify-content: space-between; gap: 10px;
      margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);
    }
    .aps-health-item { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; color: var(--text-muted); font-weight: 600; }
    .aps-health-item .aps-dot {
      width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .aps-health-item .aps-dot.online { background: var(--success); box-shadow: 0 0 5px rgba(34,197,94,0.5); }
    .aps-health-item .aps-dot.offline { background: var(--error); box-shadow: 0 0 5px rgba(239,68,68,0.5); }
    .aps-health-item .aps-dot.pending { background: var(--warning); animation: aps-pulse-health 1.5s infinite; }
    @keyframes aps-pulse-health { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    .aps-logs-title { color: var(--text-muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem; }
    .aps-logs { display: flex; flex-direction: column; gap: 6px; max-height: 260px; overflow-y: auto; }
    .aps-logs::-webkit-scrollbar { width: 3px; }
    .aps-logs::-webkit-scrollbar-thumb { background: var(--primary-200); }
    .aps-log-row { background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: 6px; padding: 0.5rem 0.65rem; }
    .aps-log-top { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .aps-log-ip { color: var(--primary); font-size: 0.75rem; font-weight: 600; font-family: monospace; }
    .aps-log-date { color: var(--text-muted); font-size: 0.68rem; }
    .aps-log-meta { display: flex; gap: 8px; margin-bottom: 2px; }
    .aps-log-page { color: var(--success); font-size: 0.72rem; font-family: monospace; }
    .aps-log-ref { color: var(--text-muted); font-size: 0.68rem; }
    .aps-log-ua { color: var(--text-muted); font-size: 0.65rem; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .aps-logs-empty { color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem; }
    .aps-projects { display: flex; flex-direction: column; gap: 8px; }
    .aps-project { background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
    .aps-project-header { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0.85rem; cursor: pointer; color: var(--text-secondary); font-size: 0.82rem; font-weight: 600; transition: background 0.2s; }
    .aps-project-header:hover { background: var(--primary-100); color: var(--primary); }
    .aps-chevron { color: var(--text-muted); transition: transform 0.25s; font-size: 0.75rem; }
    .aps-chevron.rotated { transform: rotate(180deg); }
    .aps-project-body { padding: 0 0.85rem 0.85rem; display: flex; flex-direction: column; gap: 0.65rem; }
    .aps-proj-desc { color: var(--text-secondary); font-size: 0.78rem; margin: 0; line-height: 1.5; }
    .aps-proj-block-title { color: var(--text-muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
    .aps-proj-block-title i { color: var(--primary); font-size: 0.65rem; }
    .aps-proj-text { color: var(--text-secondary); font-size: 0.78rem; margin: 0; }
    .aps-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .aps-tag { background: var(--primary-100); color: var(--primary); border: 1px solid var(--primary-200); border-radius: 4px; padding: 2px 7px; font-size: 0.68rem; font-weight: 600; }
    .aps-list { margin: 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 3px; }
    .aps-list li { color: var(--text-secondary); font-size: 0.76rem; }
    .aps-theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .aps-theme-chip { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 7px; border: 1.5px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-muted); cursor: pointer; font-size: 0.72rem; font-weight: 600; transition: all 0.18s; font-family: inherit; }
    .aps-theme-chip i { font-size: 0.7rem; }
    .aps-theme-chip:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-100); }
    .aps-theme-chip.active { border-color: var(--primary); background: var(--primary); color: #fff; box-shadow: 0 2px 8px var(--primary-200); }
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
  isMobile = false;

  // Notifications
   notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  notiFilter: 'all' | 'request' | 'system' = 'all';
  health?: SystemHealth;
  private healthSub?: Subscription;

  get filteredNotifications() {
    if (this.notiFilter === 'all') return this.notifications;
    if (this.notiFilter === 'request') return this.notifications.filter(n => ['meeting', 'contact', 'hire'].includes(n.type || ''));
    return this.notifications.filter(n => !['meeting', 'contact', 'hire'].includes(n.type || ''));
  }

  // Toasts
  toasts: Toast[] = [];

  private sessionId = '';
  private isBrowser: boolean;
  private closeTimer: any;
  private socketSub?: Subscription;
  private notiSub?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService,
    private socket: SocketService,
    private cookieService: CookieService,
    private notificationService: NotificationService,
    private healthService: HealthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('window:resize')
  onResize() { this.isMobile = window.innerWidth <= 768; }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.isMobile = window.innerWidth <= 768;
    
    // Use cookies for session ID (7 days)
    this.sessionId = this.cookieService.get('_vsid') || this.genId();
    this.cookieService.set('_vsid', this.sessionId, 7);

    // Sync with NotificationService
    this.notificationService.notifications$.subscribe(notis => {
      this.notifications = notis;
      this.unreadCount = notis.filter(n => !n.isRead).length;
    });

    this.healthSub = this.healthService.health$.subscribe(h => this.health = h);

    this.checkAdmin();
    this.trackVisit();
    this.fetchLive();
    this.fetchHistory();
    this.themeService.current$.subscribe((id: string) => this.currentTheme = id);

    // Live-watching count
    this.socketSub = this.socket.calendarUpdates$.subscribe(data => {
      if (data.watching !== undefined) this.liveCount = data.watching;
    });

    // Real-time inbound notifications (meeting / contact / hire requests)
    this.notiSub = this.socket.notifications$.subscribe(data => {
      const iconMap: Record<string, string> = {
        meeting: 'fas fa-calendar-check',
        contact: 'fas fa-envelope',
        hire:    'fas fa-briefcase'
      };
      const icon = iconMap[data.type] || 'fas fa-bell';
      // Bell panel entry
      this.notificationService.addNotification(data.title, data.message, icon, data.type, 'success');
      // Toast row
      this.showToast(data.title, data.message, 'success', icon);
    });

    this.setupNotifications();
  }

  ngOnDestroy() {
    this.socketSub?.unsubscribe();
    this.notiSub?.unsubscribe();
    this.healthSub?.unsubscribe();
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  private setupNotifications() {
    // 1. Welcome Notification (immediate)
    const hasWelcome = this.notifications.some(n => n.title === 'Welcome!');
    if (!hasWelcome) {
      this.notificationService.addNotification('Welcome!', 'Thanks for visiting my portfolio. Feel free to explore my projects.', 'fas fa-hand-sparkles', 'system');
    }

    // 2. Last Update (30 seconds)
    setTimeout(() => {
      const hasUpdate = this.notifications.some(n => n.title === 'System Update');
      if (!hasUpdate) {
        this.notificationService.addNotification('System Update', 'Latest improvements: Added real-time analytics and calendar refactor.', 'fas fa-sync-alt', 'system');
      }
    }, 30000);

    // 3. Next Release (2 minutes)
    setTimeout(() => {
      const hasRelease = this.notifications.some(n => n.title === 'Upcoming Release');
      if (!hasRelease) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        const dateStr = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        this.notificationService.addNotification('Upcoming Release', `Next major update scheduled for ${dateStr} at 10:00 AM.`, 'fas fa-calendar-check', 'system');
      }
    }, 120000);
  }

  // Legacy method removed

  private saveNotifications() {
    // Handled by service
  }

  private fetchHistory() {
    this.http.get<HistoryResponse>(`${environment.apiUrl}/analytics/history`)
      .subscribe(r => {
        if (r.success && r.data.length) {
          const historyNotis: Notification[] = r.data.map(item => ({
            id: item.id || Date.now(),
            title: item.title,
            message: item.message,
            icon: item.icon || 'fas fa-history',
            time: new Date(item.timestamp),
            isRead: true, // History is considered read
            type: item.type,
            status: item.status
          }));

          // Merge history with current
          const merged = [...this.notifications];
          historyNotis.forEach(h => {
            const exists = merged.some(curr => curr.message === h.message);
            if (!exists) merged.push(h);
          });

          merged.sort((a, b) => b.time.getTime() - a.time.getTime());
          this.notificationService.setNotifications(merged.slice(0, 40));
        }
      });
  }

  showToast(title: string, message: string, type: Toast['type'] = 'info', icon = 'fas fa-bell') {
    const t: Toast = { id: Date.now(), title, message, type, icon };
    this.toasts.push(t);
    setTimeout(() => this.dismissToast(t.id), 5000);
  }

  dismissToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
    this.showNotifications = false;
  }

  private genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  private checkAdmin() {
    const token = this.cookieService.get('admin_token');
    if (!token) { this.isAdmin = false; return; }
    try {
      const p = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = p.exp * 1000 > Date.now() && p.role === 'admin';
    } catch { this.isAdmin = false; }
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
      .subscribe((r: { success: boolean; watching: number }) => { if (r.success) this.liveCount = r.watching; });
  }

  // Desktop-only hover handlers
  onEnterDesktop() {
    if (this.isMobile) return;
    clearTimeout(this.closeTimer);
    this.isOpen = true;
    this.checkAdmin();
    if (this.isAdmin) this.loadStats();
  }

  onLeaveDesktop() {
    if (this.isMobile) return;
    this.closeTimer = setTimeout(() => {
      this.isOpen = false;
      this.showNotifications = false;
    }, 300);
  }

  // Mobile hamburger click toggle
  toggleMobile() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) { this.checkAdmin(); if (this.isAdmin) this.loadStats(); }
    else this.showNotifications = false;
  }

  // Desktop strip click also works
  onEnter() { this.onEnterDesktop(); }
  onLeave() { this.onLeaveDesktop(); }

  applyTheme(t: AppTheme) { this.themeService.setTheme(t.id); }

  goAdmin() { this.isOpen = false; this.router.navigate(['/admin']); }

  toggleProject(i: number) { this.openProject = this.openProject === i ? null : i; }

  private loadStats() {
    const token = this.cookieService.get('admin_token');
    if (!token) return;
    this.http.get<{ success: boolean; data: StatsData }>(`${environment.apiUrl}/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe((r: { success: boolean; data: StatsData }) => { if (r.success) this.stats = r.data; });
  }

  barHeight(count: number): number {
    if (!this.stats?.monthlyChart.length) return 0;
    const max = Math.max(...this.stats.monthlyChart.map(m => m.count));
    return max ? Math.max(8, Math.round((count / max) * 100)) : 8;
  }
}
