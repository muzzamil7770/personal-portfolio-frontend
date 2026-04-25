import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CookieService } from './cookie.service';

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  provider?: string;
  command?: string | null;
  isTyping?: boolean;
}

export interface ChatResponse {
  success: boolean;
  data: {
    text: string;
    provider: string;
    command: string | null;
    timestamp: string;
    sessionId: string;
    messageCount: number;
  };
}

export interface ChatStats {
  totalRequests: number;
  geminiRequests: number;
  openRouterRequests: number;
  ollamaRequests: number;
  failedRequests: number;
  fallbackActivations: number;
  activeConversations: number;
  successRate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = environment.apiUrl;
  private sessionId: string | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  isTyping$ = this.isTypingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.loadSession();
  }

  /**
   * Load or create session ID
   */
  private loadSession(): void {
    this.sessionId = this.cookieService.get('chat_session_id');
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
      this.cookieService.set('chat_session_id', this.sessionId, 7);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return this.messagesSubject.getValue();
  }

  /**
   * Add message to local state
   */
  addMessage(message: ChatMessage): void {
    const messages = this.messagesSubject.getValue();
    this.messagesSubject.next([...messages, message]);
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  /**
   * Send message to AI
   */
  sendMessage(message: string): Observable<ChatResponse> {
    if (!this.sessionId) {
      this.loadSession();
    }

    this.isTypingSubject.next(true);

    const payload = {
      message: message.trim(),
      sessionId: this.sessionId
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, payload).pipe(
      tap(response => {
        this.isTypingSubject.next(false);
        if (response.success) {
          // Update session if server returned a new one
          if (response.data.sessionId) {
            this.sessionId = response.data.sessionId;
            this.cookieService.set('chat_session_id', this.sessionId, 7);
          }
        }
      }),
      catchError(error => {
        this.isTypingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear conversation on server
   */
  clearConversation(): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/clear`, { sessionId: this.sessionId }).pipe(
      tap(() => {
        this.clearMessages();
        this.sessionId = this.generateSessionId();
        this.cookieService.set('chat_session_id', this.sessionId, 7);
      }),
      catchError(error => {
        this.clearMessages();
        this.sessionId = this.generateSessionId();
        this.cookieService.set('chat_session_id', this.sessionId, 7);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available commands
   */
  getCommands(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/commands`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Get AI statistics (admin only)
   */
  getStats(): Observable<{ success: boolean; data: ChatStats }> {
    const token = this.cookieService.get('admin_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<{ success: boolean; data: ChatStats }>(`${this.apiUrl}/chat/stats`, { headers }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.cookieService.set('chat_session_id', this.sessionId, 7);
    this.clearMessages();
  }
}
