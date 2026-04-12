import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'table' | 'kpi' | 'list-rows' | 'card' | 'text' | 'dialog';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- TABLE -->
    <div class="sk-table" *ngIf="variant === 'table'">
      <div class="sk-thead" [style.grid-template-columns]="'repeat('+cols+',1fr)'">
        <div class="sk-th" *ngFor="let c of colArr"></div>
      </div>
      <div class="sk-row" [style.grid-template-columns]="'repeat('+cols+',1fr)'" *ngFor="let r of rowArr; let i = index">
        <div class="sk-cell" *ngFor="let c of colArr; let j = index">
          <div class="sk-bar" [style.width]="widths[i % 5][j % 6]"></div>
        </div>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="sk-kpi-grid" *ngIf="variant === 'kpi'">
      <div class="sk-kpi-card" *ngFor="let k of rowArr">
        <div class="sk-kpi-icon"></div>
        <div class="sk-kpi-num"></div>
        <div class="sk-kpi-lbl"></div>
      </div>
    </div>

    <!-- LIST ROWS -->
    <div class="sk-list" *ngIf="variant === 'list-rows'">
      <div class="sk-list-row" *ngFor="let r of rowArr">
        <div class="sk-list-icon"></div>
        <div class="sk-list-main">
          <div class="sk-bar" style="width:55%"></div>
          <div class="sk-bar" style="width:72%; margin-top:7px"></div>
        </div>
        <div class="sk-list-time"></div>
      </div>
    </div>

    <!-- CARD -->
    <div class="sk-card" *ngIf="variant === 'card'">
      <div class="sk-bar" style="width:40%; height:14px; margin-bottom:14px"></div>
      <div class="sk-bar" *ngFor="let r of rowArr; let last = last"
           style="margin-bottom:9px"
           [style.width]="last ? '55%' : '100%'"></div>
    </div>

    <!-- TEXT LINES -->
    <div class="sk-text" *ngIf="variant === 'text'">
      <div class="sk-bar" *ngFor="let r of rowArr; let last = last"
           [style.width]="last ? '60%' : '100%'"
           style="margin-bottom:8px"></div>
    </div>

    <!-- DIALOG FIELDS -->
    <div class="sk-dialog" *ngIf="variant === 'dialog'">
      <div class="sk-dialog-field" *ngFor="let r of rowArr">
        <div class="sk-bar" style="width:28%; height:9px; margin-bottom:6px"></div>
        <div class="sk-bar" style="width:100%; height:36px; border-radius:8px"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes sk-pulse {
      0%, 100% { opacity: 0.3; }
      50%       { opacity: 0.8; }
    }
    .sk-bar {
      height: 11px; background: var(--bg-tertiary);
      border-radius: 4px; animation: sk-pulse 1.6s ease-in-out infinite;
    }

    /* TABLE */
    .sk-table { border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; }
    .sk-thead { display: grid; background: var(--bg-secondary); padding: 0.75rem 1rem; gap: 1rem; }
    .sk-th { height: 12px; background: var(--bg-tertiary); border-radius: 4px; animation: sk-pulse 1.6s ease-in-out infinite; }
    .sk-row { display: grid; padding: 0.75rem 1rem; gap: 1rem; border-top: 1px solid var(--border-light); }
    .sk-cell { display: flex; align-items: center; }

    /* KPI */
    .sk-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
    @media(max-width:700px) { .sk-kpi-grid { grid-template-columns: repeat(2,1fr); } }
    @media(max-width:400px) { .sk-kpi-grid { grid-template-columns: repeat(2,1fr); } }
    .sk-kpi-card {
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.25rem; text-align: center;
    }
    .sk-kpi-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-tertiary); margin: 0 auto 0.6rem; animation: sk-pulse 1.6s ease-in-out infinite; }
    .sk-kpi-num  { height: 28px; width: 55%; background: var(--bg-tertiary); border-radius: 6px; margin: 0 auto 8px; animation: sk-pulse 1.6s ease-in-out infinite; }
    .sk-kpi-lbl  { height: 10px; width: 45%; background: var(--bg-tertiary); border-radius: 4px; margin: 0 auto; animation: sk-pulse 1.6s ease-in-out infinite; }

    /* LIST ROWS */
    .sk-list { display: flex; flex-direction: column; }
    .sk-list-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.85rem 0.5rem; border-bottom: 1px solid var(--border-light);
    }
    .sk-list-row:last-child { border-bottom: none; }
    .sk-list-icon { width: 36px; height: 36px; border-radius: 8px; background: var(--bg-tertiary); flex-shrink: 0; animation: sk-pulse 1.6s ease-in-out infinite; }
    .sk-list-main { flex: 1; }
    .sk-list-time { width: 44px; height: 28px; border-radius: 6px; background: var(--bg-tertiary); flex-shrink: 0; animation: sk-pulse 1.6s ease-in-out infinite; }

    /* CARD */
    .sk-card {
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.25rem;
    }

    /* TEXT */
    .sk-text { display: flex; flex-direction: column; }

    /* DIALOG */
    .sk-dialog { display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; }
    .sk-dialog-field { display: flex; flex-direction: column; }
  `]
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'table';
  @Input() rows = 5;
  @Input() cols = 6;

  get rowArr() { return Array(this.rows).fill(0); }
  get colArr() { return Array(this.cols).fill(0); }

  // Pre-computed width patterns so they don't shift on re-render
  readonly widths = [
    ['80%','65%','70%','55%','60%','75%'],
    ['70%','80%','55%','75%','65%','60%'],
    ['60%','70%','80%','65%','75%','55%'],
    ['75%','55%','65%','80%','60%','70%'],
    ['65%','75%','60%','70%','55%','80%'],
  ];
}
