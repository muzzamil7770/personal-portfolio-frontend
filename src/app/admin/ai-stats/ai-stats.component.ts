import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiChatService, ChatStats } from '../../core/services/ai-chat.service';
import { interval, Subject } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-ai-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-stats-wrap">
      <div class="ai-stats-header">
        <i class="fas fa-brain"></i>
        <h2>AI Chatbot Analytics</h2>
      </div>

      <div class="stats-grid" *ngIf="stats; else loading">
        <!-- Total Requests -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalRequests }}</div>
            <div class="stat-label">Total Messages</div>
          </div>
        </div>

        <!-- Success Rate -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.successRate }}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>

        <!-- Gemini Requests -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4285f4, #34a853);">
            <i class="fab fa-google"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.geminiRequests }}</div>
            <div class="stat-label">Gemini API</div>
          </div>
        </div>

        <!-- OpenRouter Requests -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
            <i class="fas fa-route"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.openRouterRequests }}</div>
            <div class="stat-label">OpenRouter API</div>
          </div>
        </div>

        <!-- Ollama Requests -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #30cfd0, #330867);">
            <i class="fas fa-server"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.ollamaRequests }}</div>
            <div class="stat-label">Ollama (Local)</div>
          </div>
        </div>

        <!-- Fallback Activations -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a, #fee140);">
            <i class="fas fa-bolt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.fallbackActivations }}</div>
            <div class="stat-label">Fallbacks Used</div>
          </div>
        </div>

        <!-- Failed Requests -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.failedRequests }}</div>
            <div class="stat-label">Failed Requests</div>
          </div>
        </div>

        <!-- Active Conversations -->
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeConversations }}</div>
            <div class="stat-label">Active Sessions</div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading AI statistics...</span>
        </div>
      </ng-template>

      <!-- Info Banner -->
      <div class="info-banner">
        <i class="fas fa-info-circle"></i>
        <span>Statistics are tracked in real-time and reset when the server restarts.</span>
      </div>
    </div>
  `,
  styles: [`
    .ai-stats-wrap {
      padding: 1.5rem;
    }
    .ai-stats-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--border-color);
    }
    .ai-stats-header i {
      font-size: 1.75rem;
      color: var(--primary);
    }
    .ai-stats-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      transition: all 0.2s ease-out;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .stat-content {
      flex: 1;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 3rem;
      color: var(--text-muted);
      font-size: 1rem;
    }
    .loading-state i {
      font-size: 2rem;
    }
    .info-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 1rem 1.25rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .info-banner i {
      color: var(--primary);
      font-size: 1.1rem;
    }
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      .stat-card {
        padding: 1rem;
      }
      .stat-icon {
        width: 48px;
        height: 48px;
        font-size: 1.25rem;
      }
      .stat-value {
        font-size: 1.5rem;
      }
    }
    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .ai-stats-header h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class AiStatsComponent implements OnInit, OnDestroy {
  stats: ChatStats | null = null;
  private destroy$ = new Subject<void>();

  constructor(private aiChat: AiChatService) {}

  ngOnInit(): void {
    // Initial load
    this.loadStats();

    // Auto-refresh every 10 seconds
    interval(10000)
      .pipe(
        takeUntil(this.destroy$),
        startWith(0)
      )
      .subscribe(() => this.loadStats());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStats(): void {
    this.aiChat.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load AI stats:', err);
      }
    });
  }
}
