import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage } from '../../../core/services/ai-chat.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss'],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateY(20px) scale(0.95)',
        opacity: 0
      })),
      transition('void => *', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class AiChatbotComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputElement') inputElement!: ElementRef;

  messages: ChatMessage[] = [];
  inputMessage = '';
  isOpen = false;
  isTyping = false;
  isLoading = false;
  showCommands = true;
  availableCommands: any = {};
  private destroy$ = new Subject<void>();

  constructor(
    public aiChat: AiChatService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to messages
    this.aiChat.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages: ChatMessage[]) => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 50);
    });

    // Subscribe to typing state
    this.aiChat.isTyping$.pipe(takeUntil(this.destroy$)).subscribe((typing: boolean) => {
      this.isTyping = typing;
      setTimeout(() => this.scrollToBottom(), 50);
    });

    // Load commands
    this.loadCommands();

    // Add welcome message if no messages
    if (this.messages.length === 0) {
      this.addWelcomeMessage();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load available commands
   */
  loadCommands(): void {
    this.aiChat.getCommands().subscribe({
      next: (response: any) => {
        this.availableCommands = response.data.commands;
      },
      error: () => {
        // Silently fail - commands are optional
      }
    });
  }

  /**
   * Add welcome message
   */
  addWelcomeMessage(): void {
    this.aiChat.addMessage({
      sender: 'system',
      text: "👋 Hi! I'm Muhammad's AI assistant. I can tell you about his skills, projects, experience, and more. Type **/help** to see all commands!",
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Toggle chat open/close
   */
  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.inputElement?.nativeElement?.focus();
        this.scrollToBottom();
      }, 100);
    }
  }

  /**
   * Send message
   */
  async sendMessage(): Promise<void> {
    const message = this.inputMessage.trim();
    if (!message || this.isLoading) return;

    // Add user message
    this.aiChat.addMessage({
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    });

    this.inputMessage = '';
    this.isLoading = true;
    this.showCommands = false;

    try {
      const response = await this.aiChat.sendMessage(message).toPromise();
      
      if (response?.success) {
        this.aiChat.addMessage({
          sender: 'ai',
          text: response.data.text,
          timestamp: response.data.timestamp,
          provider: response.data.provider,
          command: response.data.command
        });
      } else {
        this.aiChat.addMessage({
          sender: 'system',
          text: "⚠️ Sorry, I couldn't process that request. Please try again!",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      this.aiChat.addMessage({
        sender: 'system',
        text: "❌ Connection error. Please check your internet and try again.",
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isLoading = false;
      setTimeout(() => this.inputElement?.nativeElement?.focus(), 50);
    }
  }

  /**
   * Handle command click
   */
  sendCommand(command: string): void {
    this.inputMessage = command;
    this.sendMessage();
  }

  /**
   * Clear conversation
   */
  clearConversation(): void {
    this.aiChat.clearConversation().subscribe({
      next: () => {
        this.addWelcomeMessage();
        this.showCommands = true;
      },
      error: () => {
        this.aiChat.resetSession();
        this.addWelcomeMessage();
      }
    });
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      // Ignore scroll errors
    }
  }

  /**
   * Handle Enter key
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Format message with basic markdown
   */
  formatMessage(text: string): string {
    if (!text) return '';
    
    // Bold: **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code: `text`
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }
}
