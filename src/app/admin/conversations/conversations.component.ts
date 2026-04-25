import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CookieService } from '../../core/services/cookie.service';

interface Conversation {
  id: string;
  sessionId: string;
  messageCount: number;
  startTime: string;
  lastActive: string;
  userAgent?: string;
  ipAddress?: string;
  status: string;
}

interface ChatMessage {
  sessionId: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  provider?: string;
  command?: string;
  messageIndex: number;
}

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="conversations-wrap">
      <div class="conversations-header">
        <div class="header-left">
          <i class="fas fa-comments"></i>
          <h2>AI Chat Conversations</h2>
        </div>
        <div class="header-actions">
          <button class="refresh-btn" (click)="loadConversations()" [disabled]="loading">
            <i class="fas" [class.fa-spinner]="loading" [class.fa-spin]="loading" [class.fa-sync-alt]="!loading"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row" *ngIf="stats">
        <div class="stat-card">
          <i class="fas fa-comments"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalConversations }}</div>
            <div class="stat-label">Total Conversations</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-envelope"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalMessages }}</div>
            <div class="stat-label">Total Messages</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-check"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeConversations }}</div>
            <div class="stat-label">Active (1hr)</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-calculator"></i>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgMessagesPerConversation }}</div>
            <div class="stat-label">Avg Messages</div>
          </div>
        </div>
      </div>

      <!-- Conversations List -->
      <div class="conversations-content">
        <div class="loading-state" *ngIf="loading && !conversations.length">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading conversations...</span>
        </div>

        <div class="empty-state" *ngIf="!loading && !conversations.length">
          <i class="fas fa-inbox"></i>
          <p>No conversations yet</p>
        </div>

        <div class="conversations-list" *ngIf="!loading && conversations.length > 0">
          <div class="conversation-item" *ngFor="let conv of conversations" 
               [class.active]="conv.id === selectedConversationId"
               (click)="viewConversation(conv)">
            <div class="conv-header">
              <div class="conv-id">
                <i class="fas fa-comment-dots"></i>
                <span class="id-text">{{ conv.sessionId | slice:0:12 }}...</span>
              </div>
              <div class="conv-actions">
                <button class="delete-btn" (click)="deleteConversation(conv.id, $event)" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="conv-details">
              <div class="conv-meta">
                <span><i class="fas fa-envelope"></i> {{ conv.messageCount }} messages</span>
                <span><i class="fas fa-clock"></i> {{ conv.lastActive | date:'short' }}</span>
              </div>
              <div class="conv-status" [class.active-status]="conv.status === 'active'">
                {{ conv.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Messages View -->
        <div class="messages-view" *ngIf="selectedConversationId && selectedMessages.length > 0">
          <div class="messages-header">
            <button class="back-btn" (click)="closeMessages()">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <h3>Conversation: {{ selectedConversationId | slice:0:20 }}...</h3>
            <span class="message-count">{{ selectedMessages.length }} messages</span>
          </div>

          <div class="messages-container">
            <div class="message" *ngFor="let msg of selectedMessages" 
                 [class.user-msg]="msg.sender === 'user'" 
                 [class.ai-msg]="msg.sender === 'ai'"
                 [class.system-msg]="msg.sender === 'system'">
              <div class="message-bubble">
                <div class="message-sender">
                  <i class="fas" [class.fa-user]="msg.sender === 'user'" 
                           [class.fa-robot]="msg.sender === 'ai'"
                           [class.fa-info-circle]="msg.sender === 'system'"></i>
                  <span>{{ msg.sender | titlecase }}</span>
                  <span class="message-time">{{ msg.timestamp | date:'shortTime' }}</span>
                  <span class="provider-badge" *ngIf="msg.provider">{{ msg.provider }}</span>
                </div>
                <div class="message-text" [innerHTML]="formatText(msg.text)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .conversations-wrap {
      padding: 1.5rem;
      background: var(--bg-primary);
      min-height: 100vh;
    }
    .conversations-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--border-color);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-left i {
      font-size: 1.75rem;
      color: var(--primary);
    }
    .header-left h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--primary-100);
      border: 1px solid var(--primary);
      color: var(--primary);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease-out;

      &:hover:not(:disabled) {
        background: var(--primary);
        color: #fff;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;

      i {
        font-size: 2rem;
        color: var(--primary);
      }
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--text-muted);
      gap: 12px;

      i {
        font-size: 2.5rem;
      }
    }
    .conversations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .conversation-item {
      padding: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease-out;

      &:hover {
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: var(--primary);
        background: var(--primary-100);
      }
    }
    .conv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .conv-id {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary);
      font-weight: 600;
    }
    .delete-btn {
      padding: 6px 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease-out;

      &:hover {
        background: #ef4444;
        color: #fff;
      }
    }
    .conv-meta {
      display: flex;
      gap: 1rem;
      color: var(--text-muted);
      font-size: 0.85rem;

      i {
        margin-right: 4px;
      }
    }
    .conv-status {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-muted);

      &.active-status {
        color: #22c55e;
      }
    }
    .messages-view {
      margin-top: 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    .messages-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);

      h3 {
        margin: 0;
        flex: 1;
        font-size: 1.1rem;
        color: var(--text-primary);
      }
    }
    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease-out;

      &:hover {
        background: var(--primary-100);
        color: var(--primary);
      }
    }
    .message-count {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .messages-container {
      padding: 1.25rem;
      max-height: 600px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .message {
      &.user-msg {
        display: flex;
        justify-content: flex-end;

        .message-bubble {
          background: var(--primary);
          color: #fff;
          border-radius: 16px 16px 4px 16px;
        }
      }

      &.ai-msg, &.system-msg {
        display: flex;
        justify-content: flex-start;

        .message-bubble {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 16px 16px 16px 4px;
        }
      }
    }
    .message-bubble {
      max-width: 80%;
      padding: 12px 16px;
    }
    .message-sender {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 6px;
      opacity: 0.8;
    }
    .message-text {
      font-size: 0.9rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .provider-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      margin-left: 8px;
    }
    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
      .conversations-header h2 {
        font-size: 1.25rem;
      }
    }
    @media (max-width: 480px) {
      .stats-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConversationsComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedMessages: ChatMessage[] = [];
  selectedConversationId: string | null = null;
  stats: any = null;
  loading = false;
  private destroy$ = new Subject<void>();
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadConversationStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('admin_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadConversations(): void {
    this.loading = true;
    this.http.get<{ success: boolean; conversations: Conversation[] }>(
      `${this.apiUrl}/chat/conversations?limit=50`,
      { headers: this.getHeaders() }
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success) {
          this.conversations = response.conversations;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
        this.loading = false;
      }
    });
  }

  loadConversationStats(): void {
    this.http.get<{ success: boolean; stats: any }>(
      `${this.apiUrl}/chat/conversation-stats`,
      { headers: this.getHeaders() }
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.stats;
        }
      },
      error: (err) => console.error('Failed to load stats:', err)
    });
  }

  viewConversation(conv: Conversation): void {
    this.selectedConversationId = conv.id;
    this.selectedMessages = [];

    this.http.get<{ success: boolean; messages: ChatMessage[] }>(
      `${this.apiUrl}/chat/conversations/${conv.id}`,
      { headers: this.getHeaders() }
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedMessages = response.messages;
        }
      },
      error: (err) => console.error('Failed to load messages:', err)
    });
  }

  closeMessages(): void {
    this.selectedConversationId = null;
    this.selectedMessages = [];
  }

  deleteConversation(sessionId: string, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/chat/conversations/${sessionId}`,
      { headers: this.getHeaders() }
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success) {
          this.conversations = this.conversations.filter(c => c.id !== sessionId);
          if (this.selectedConversationId === sessionId) {
            this.closeMessages();
          }
        }
      },
      error: (err) => console.error('Failed to delete conversation:', err)
    });
  }

  formatText(text: string): string {
    if (!text) return '';
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }
}
