import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LogEntry {
  id: string; sessionId: string; ip: string; page: string;
  referrer: string; userAgent: string; date: string; month: string; timestamp: string;
}
interface StatsData {
  watching: number; today: number; thisMonth: number; allTime: number;
  monthlyChart: { month: string; count: number }[];
  recentLogs: LogEntry[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="an-page">
      <div class="an-header">
        <div>
          <h1 class="an-title">📊 Analytics Dashboard</h1>
          <p class="an-sub">Real-time visitor tracking & insights</p>
        </div>
        <div class="an-live-badge">
          <span class="an-live-dot"></span>
          <span>{{ stats?.watching ?? 0 }} watching now</span>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="an-kpi-grid" *ngIf="stats">
        <div class="an-kpi">
          <div class="an-kpi-icon">👁</div>
          <div class="an-kpi-val">{{ stats.watching }}</div>
          <div class="an-kpi-lbl">Live Now</div>
        </div>
        <div class="an-kpi">
          <div class="an-kpi-icon">📅</div>
          <div class="an-kpi-val">{{ stats.today }}</div>
          <div class="an-kpi-lbl">Today</div>
        </div>
        <div class="an-kpi">
          <div class="an-kpi-icon">📆</div>
          <div class="an-kpi-val">{{ stats.thisMonth }}</div>
          <div class="an-kpi-lbl">This Month</div>
        </div>
        <div class="an-kpi">
          <div class="an-kpi-icon">🌐</div>
          <div class="an-kpi-val">{{ stats.allTime }}</div>
          <div class="an-kpi-lbl">All Time</div>
        </div>
      </div>

      <!-- Monthly Chart -->
      <div class="an-card" *ngIf="stats?.monthlyChart?.length">
        <div class="an-card-title">Monthly Visits — Last 12 Months</div>
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

      <!-- Visitor Logs Table -->
      <div class="an-card">
        <div class="an-card-header">
          <div class="an-card-title">Visitor Logs</div>
          <div class="an-card-count" *ngIf="stats">{{ stats.recentLogs.length }} recent entries</div>
        </div>

        <div class="an-loading" *ngIf="loading">Loading…</div>

        <div class="an-table-wrap" *ngIf="!loading && stats">
          <table class="an-table">
            <thead>
              <tr>
                <th>#</th>
                <th>IP Address</th>
                <th>Page</th>
                <th>Referrer</th>
                <th>Date</th>
                <th>Time</th>
                <th>User Agent</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of stats.recentLogs; let i = index">
                <td class="an-td-num">{{ i + 1 }}</td>
                <td><span class="an-ip">{{ log.ip }}</span></td>
                <td><span class="an-page">{{ log.page }}</span></td>
                <td class="an-ref">{{ log.referrer || '—' }}</td>
                <td>{{ log.timestamp | date:'dd MMM yyyy' }}</td>
                <td>{{ log.timestamp | date:'HH:mm:ss' }}</td>
                <td class="an-ua" [title]="log.userAgent">{{ log.userAgent.slice(0, 50) }}…</td>
              </tr>
              <tr *ngIf="!stats.recentLogs.length">
                <td colspan="7" class="an-empty">No visitor logs yet.</td>
              </tr>
            </tbody>
          </table>
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
    .an-title { color: #f1f5f9; font-size: 1.4rem; font-weight: 800; margin: 0 0 4px; }
    .an-sub { color: #64748b; font-size: 0.85rem; margin: 0; }

    .an-live-badge {
      display: flex; align-items: center; gap: 8px;
      background: #1e293b; border: 1px solid #334155;
      border-radius: 20px; padding: 0.45rem 1rem;
      color: #f1f5f9; font-size: 0.85rem; font-weight: 600;
    }
    .an-live-dot {
      width: 9px; height: 9px; border-radius: 50%; background: #22c55e;
      animation: an-pulse 1.8s infinite;
    }
    @keyframes an-pulse {
      0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
      70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }

    .an-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
    @media(max-width:700px) { .an-kpi-grid { grid-template-columns: repeat(2,1fr); } }
    .an-kpi {
      background: #1e293b; border: 1px solid #334155; border-radius: 12px;
      padding: 1.25rem; text-align: center;
    }
    .an-kpi-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .an-kpi-val { color: #818cf8; font-size: 2rem; font-weight: 800; line-height: 1; }
    .an-kpi-lbl { color: #64748b; font-size: 0.78rem; margin-top: 4px; }

    .an-card {
      background: #1e293b; border: 1px solid #334155;
      border-radius: 12px; padding: 1.25rem; overflow: hidden;
    }
    .an-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .an-card-title { color: #f1f5f9; font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; }
    .an-card-header .an-card-title { margin-bottom: 0; }
    .an-card-count { color: #64748b; font-size: 0.78rem; }

    .an-chart { overflow-x: auto; }
    .an-chart-bars {
      display: flex; align-items: flex-end; gap: 8px;
      min-width: 500px; height: 160px; padding-bottom: 28px; position: relative;
    }
    .an-bar-col {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end; gap: 4px; height: 100%;
    }
    .an-bar-val { color: #64748b; font-size: 0.65rem; }
    .an-bar {
      width: 100%; background: linear-gradient(180deg, #6366f1, #818cf8);
      border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.4s;
    }
    .an-bar-lbl { color: #475569; font-size: 0.62rem; white-space: nowrap; }

    .an-loading { color: #64748b; text-align: center; padding: 2rem; }

    .an-table-wrap { overflow-x: auto; }
    .an-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .an-table th {
      background: #0f172a; color: #64748b; font-weight: 600;
      padding: 0.6rem 0.75rem; text-align: left; white-space: nowrap;
      border-bottom: 1px solid #334155;
    }
    .an-table td {
      padding: 0.55rem 0.75rem; border-bottom: 1px solid #1e293b;
      color: #94a3b8; vertical-align: middle;
    }
    .an-table tr:hover td { background: #0f172a; }
    .an-td-num { color: #475569; font-size: 0.75rem; }
    .an-ip { color: #818cf8; font-family: monospace; font-weight: 600; }
    .an-page { color: #22c55e; font-family: monospace; }
    .an-ref { color: #64748b; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .an-ua { color: #475569; font-family: monospace; font-size: 0.72rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: help; }
    .an-empty { text-align: center; color: #475569; padding: 2rem; }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  stats: StatsData | null = null;
  loading = true;
  private pollSub?: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
    this.pollSub = interval(15000).pipe(
      switchMap(() => this.fetchStats())
    ).subscribe(r => { if (r.success) this.stats = r.data; });
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  private fetchStats() {
    const token = localStorage.getItem('admin_token') || '';
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
}
