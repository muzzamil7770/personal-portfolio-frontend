import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { CookieService } from '../../core/services/cookie.service';

interface LogEntry {
  id: string; sessionId: string; ip: string; page: string;
  referrer: string; userAgent: string; date: string; month: string; timestamp: string;
  browser?: string; browserVersion?: string; os?: string; osVersion?: string;
  device?: string; screenWidth?: number; screenHeight?: number;
  language?: string; timezone?: string; colorDepth?: number;
  cookiesEnabled?: boolean; doNotTrack?: string; connectionType?: string;
}
interface StatsData {
  watching: number; today: number; thisMonth: number; allTime: number;
  monthlyChart: { month: string; count: number }[];
  recentLogs: LogEntry[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, DatePipe, SkeletonComponent],
  template: `
    <div class="an-page">
      <div class="an-header">
        <div>
          <h1 class="an-title">
            <i class="fas fa-chart-bar"></i> Analytics Dashboard
          </h1>
          <p class="an-sub">Real-time visitor tracking &amp; insights</p>
        </div>
        <div class="an-live-badge">
          <span class="an-live-dot"></span>
          <span>{{ stats?.watching ?? 0 }} watching now</span>
        </div>
      </div>

      <!-- KPI Skeleton -->
      <app-skeleton *ngIf="loading && !stats" variant="kpi" [rows]="4"></app-skeleton>

      <!-- KPI Cards -->
      <div class="an-kpi-grid" *ngIf="stats">
        <div class="an-kpi">
          <i class="fas fa-eye an-kpi-icon"></i>
          <div class="an-kpi-val">{{ stats.watching }}</div>
          <div class="an-kpi-lbl">Live Now</div>
        </div>
        <div class="an-kpi">
          <i class="fas fa-calendar-day an-kpi-icon"></i>
          <div class="an-kpi-val">{{ stats.today }}</div>
          <div class="an-kpi-lbl">Today</div>
        </div>
        <div class="an-kpi">
          <i class="fas fa-calendar-alt an-kpi-icon"></i>
          <div class="an-kpi-val">{{ stats.thisMonth }}</div>
          <div class="an-kpi-lbl">This Month</div>
        </div>
        <div class="an-kpi">
          <i class="fas fa-globe an-kpi-icon"></i>
          <div class="an-kpi-val">{{ stats.allTime }}</div>
          <div class="an-kpi-lbl">All Time</div>
        </div>
      </div>

      <!-- Monthly Chart -->
      <div class="an-card" *ngIf="stats?.monthlyChart?.length">
        <div class="an-card-title">
          <i class="fas fa-chart-line"></i> Monthly Visits — Last 12 Months
        </div>
        <div class="an-chart">
          <div class="an-chart-bars">
            <div class="an-bar-col" *ngFor="let m of stats!.monthlyChart">
              <div class="an-bar-val">{{ m.count }}</div>
              <div class="an-bar" [style.height.px]="barPx(m.count)" [title]="m.month + ': ' + m.count + ' visits'"></div>
              <div class="an-bar-lbl">{{ m.month }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Visitor Logs -->
      <div class="an-card">
        <div class="an-card-header">
          <div class="an-card-title">
            <i class="fas fa-list-ul"></i> Visitor Logs
          </div>
          <div class="an-card-count" *ngIf="stats">{{ stats.recentLogs.length }} recent entries</div>
        </div>

        <!-- Skeleton -->
        <app-skeleton *ngIf="loading" variant="list-rows" [rows]="6"></app-skeleton>

        <div class="an-logs" *ngIf="!loading && stats">
          <div class="an-log-row" *ngFor="let log of stats.recentLogs; let i = index">

            <div class="an-log-index">
              <span class="an-idx">{{ i + 1 }}</span>
              <i class="an-device-icon" [class]="deviceIcon(log.device)" [title]="log.device || 'desktop'"></i>
            </div>

            <div class="an-log-main">
              <div class="an-log-row1">
                <span class="an-ip">{{ log.ip }}</span>
                <span class="an-page-badge">
                  <i class="fas fa-link"></i> {{ log.page }}
                </span>
                <span class="an-browser-badge" *ngIf="log.browser">
                  <i [class]="browserIcon(log.browser)"></i> {{ log.browser }} {{ log.browserVersion }}
                </span>
                <span class="an-os-badge" *ngIf="log.os">
                  <i [class]="osIcon(log.os)"></i> {{ log.os }} {{ log.osVersion }}
                </span>
              </div>
              <div class="an-log-row2">
                <span class="an-meta" *ngIf="log.language">
                  <i class="fas fa-language"></i> {{ log.language }}
                </span>
                <span class="an-meta" *ngIf="log.timezone">
                  <i class="fas fa-clock"></i> {{ log.timezone }}
                </span>
                <span class="an-meta" *ngIf="log.screenWidth">
                  <i class="fas fa-desktop"></i> {{ log.screenWidth }}×{{ log.screenHeight }}
                </span>
                <span class="an-meta" *ngIf="log.connectionType">
                  <i class="fas fa-wifi"></i> {{ log.connectionType }}
                </span>
                <span class="an-meta" *ngIf="log.referrer">
                  <i class="fas fa-external-link-alt"></i> {{ log.referrer | slice:0:40 }}
                </span>
              </div>
            </div>

            <div class="an-log-time">
              <span class="an-date">{{ log.timestamp | date:'dd MMM' }}</span>
              <span class="an-time">{{ log.timestamp | date:'HH:mm' }}</span>
            </div>

          </div>
          <div class="an-empty" *ngIf="!stats.recentLogs.length">
            <i class="fas fa-inbox"></i> No visitor logs yet.
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .an-page { display: flex; flex-direction: column; gap: 1.5rem; }

    .an-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem;
    }
    .an-title {
      color: var(--text-primary); font-size: 1.4rem; font-weight: 800; margin: 0 0 4px;
      display: flex; align-items: center; gap: 8px;
    }
    .an-title i { color: var(--primary); font-size: 1.2rem; }
    .an-sub { color: var(--text-muted); font-size: 0.85rem; margin: 0; }

    .an-live-badge {
      display: flex; align-items: center; gap: 8px;
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 20px; padding: 0.45rem 1rem;
      color: var(--text-primary); font-size: 0.85rem; font-weight: 600;
    }
    .an-live-dot {
      width: 9px; height: 9px; border-radius: 50%; background: #22c55e;
      animation: an-pulse 1.8s infinite;
    }
    @keyframes an-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
      70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }

    .an-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
    @media(max-width:700px) { .an-kpi-grid { grid-template-columns: repeat(2,1fr); } }
    .an-kpi {
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.25rem; text-align: center;
      transition: border-color 0.2s, transform 0.2s;
    }
    .an-kpi:hover { border-color: var(--primary); transform: translateY(-2px); }
    .an-kpi-icon { font-size: 1.4rem; color: var(--primary); margin-bottom: 0.5rem; display: block; }
    .an-kpi-val { color: var(--primary); font-size: 2rem; font-weight: 800; line-height: 1; }
    .an-kpi-lbl { color: var(--text-muted); font-size: 0.78rem; margin-top: 4px; }

    .an-card {
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.25rem; overflow: hidden;
    }
    .an-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .an-card-title {
      color: var(--text-primary); font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem;
      display: flex; align-items: center; gap: 7px;
    }
    .an-card-title i { color: var(--primary); }
    .an-card-header .an-card-title { margin-bottom: 0; }
    .an-card-count { color: var(--text-muted); font-size: 0.78rem; }

    .an-chart { overflow-x: auto; }
    .an-chart-bars {
      display: flex; align-items: flex-end; gap: 8px;
      min-width: 500px; height: 160px; padding-bottom: 28px;
    }
    .an-bar-col {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end; gap: 4px; height: 100%;
    }
    .an-bar-val { color: var(--text-muted); font-size: 0.65rem; }
    .an-bar {
      width: 100%; background: linear-gradient(180deg, var(--primary), var(--primary-light));
      border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.4s;
    }
    .an-bar-lbl { color: var(--text-muted); font-size: 0.62rem; white-space: nowrap; }

    /* Log rows */
    .an-logs { display: flex; flex-direction: column; }
    .an-log-row {
      display: flex; align-items: flex-start; gap: 1rem;
      padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-light);
      transition: background 0.15s;
    }
    .an-log-row:last-child { border-bottom: none; }
    .an-log-row:hover { background: var(--bg-tertiary); border-radius: 8px; }

    .an-log-index {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      min-width: 32px; flex-shrink: 0;
    }
    .an-idx { color: var(--text-muted); font-size: 0.68rem; }
    .an-device-icon { font-size: 1rem; color: var(--text-muted); }

    .an-log-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
    .an-log-row1 { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
    .an-log-row2 { display: flex; flex-wrap: wrap; gap: 5px; }

    .an-ip {
      color: var(--primary); font-family: monospace; font-weight: 700;
      font-size: 0.82rem; background: var(--primary-100); padding: 2px 8px;
      border-radius: 6px; border: 1px solid var(--border-color);
    }
    .an-page-badge {
      color: #22c55e; font-family: monospace; font-size: 0.75rem;
      background: rgba(34,197,94,0.1); padding: 2px 8px; border-radius: 6px;
      border: 1px solid rgba(34,197,94,0.2); display: flex; align-items: center; gap: 4px;
    }
    .an-browser-badge, .an-os-badge {
      color: var(--text-secondary); font-size: 0.75rem;
      background: var(--bg-tertiary); padding: 2px 8px; border-radius: 6px;
      border: 1px solid var(--border-color); display: flex; align-items: center; gap: 4px;
    }
    .an-meta {
      color: var(--text-muted); font-size: 0.72rem;
      background: var(--bg-card); padding: 2px 7px; border-radius: 5px;
      border: 1px solid var(--border-light); white-space: nowrap;
      display: flex; align-items: center; gap: 4px;
    }
    .an-meta i, .an-page-badge i, .an-browser-badge i, .an-os-badge i { font-size: 0.65rem; }

    .an-log-time {
      display: flex; flex-direction: column; align-items: flex-end;
      gap: 2px; flex-shrink: 0; min-width: 52px;
    }
    .an-date { color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; }
    .an-time { color: var(--text-muted); font-size: 0.7rem; font-family: monospace; }

    .an-empty {
      text-align: center; color: var(--text-muted); padding: 2rem;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .an-empty i { font-size: 1.2rem; }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  stats: StatsData | null = null;
  loading = true;
  private pollSub?: Subscription;
  private liveSub?: Subscription;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.load();
    this.pollSub = interval(15000).pipe(
      switchMap(() => this.fetchStats())
    ).subscribe(r => { if (r.success) this.stats = r.data; });

    this.liveSub = interval(5000).pipe(
      switchMap(() => this.http.get<{ success: boolean; watching: number }>(`${environment.apiUrl}/analytics/live`))
    ).subscribe(r => {
      if (r.success && this.stats) this.stats = { ...this.stats, watching: r.watching };
    });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
    this.liveSub?.unsubscribe();
  }

  private fetchStats() {
    const token = this.cookieService.get('admin_token') || '';
    return this.http.get<{ success: boolean; data: StatsData }>(`${environment.apiUrl}/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  private load() {
    this.loading = true;
    this.fetchStats().subscribe({
      next: r => { if (r.success) this.stats = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  barPx(count: number): number {
    if (!this.stats?.monthlyChart.length) return 4;
    const max = Math.max(...this.stats.monthlyChart.map(m => m.count));
    return max ? Math.max(4, Math.round((count / max) * 120)) : 4;
  }

  deviceIcon(device?: string): string {
    if (device === 'mobile') return 'fas fa-mobile-alt';
    if (device === 'tablet') return 'fas fa-tablet-alt';
    return 'fas fa-desktop';
  }

  browserIcon(browser?: string): string {
    const map: Record<string, string> = {
      Chrome: 'fab fa-chrome',
      Firefox: 'fab fa-firefox-browser',
      Safari: 'fab fa-safari',
      Edge: 'fab fa-edge',
      Opera: 'fab fa-opera',
      IE: 'fab fa-internet-explorer'
    };
    return map[browser || ''] || 'fas fa-globe';
  }

  osIcon(os?: string): string {
    const map: Record<string, string> = {
      Windows: 'fab fa-windows',
      macOS: 'fab fa-apple',
      iOS: 'fab fa-apple',
      iPadOS: 'fab fa-apple',
      Android: 'fab fa-android',
      Linux: 'fab fa-linux'
    };
    return map[os || ''] || 'fas fa-laptop';
  }
}
