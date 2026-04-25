import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notepad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notepad-container" [class.minimized]="isMinimized">
      <div class="notepad-header" (click)="toggleMinimize()">
        <i class="fas fa-sticky-note"></i>
        <span>Meeting Notes</span>
        <div class="header-actions">
          <button (click)="clearNotes(); $event.stopPropagation()" title="Clear Notes">
            <i class="fas fa-trash"></i>
          </button>
          <button (click)="toggleMinimize(); $event.stopPropagation()" title="Minimize">
            <i class="fas" [class.fa-minus]="!isMinimized" [class.fa-plus]="isMinimized"></i>
          </button>
        </div>
      </div>

      <div class="notepad-content" *ngIf="!isMinimized">
        <textarea
          [(ngModel)]="notes"
          (ngModelChange)="onNotesChange($event)"
          placeholder="Take notes during the meeting..."
          rows="8"
          class="notes-textarea">
        </textarea>

        <div class="notepad-footer">
          <div class="char-count">{{ notes.length }}/1000</div>
          <button (click)="shareNotes()" class="share-btn" *ngIf="notes.trim()">
            <i class="fas fa-share"></i> Share Notes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notepad-container {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .notepad-container.minimized {
      width: 60px;
      height: 60px;
      cursor: pointer;
    }

    .notepad-container.minimized .notepad-header {
      justify-content: center;
      padding: 0;
    }

    .notepad-container.minimized .notepad-header span,
    .notepad-container.minimized .header-actions {
      display: none;
    }

    .notepad-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      user-select: none;
    }

    .notepad-header i {
      color: #3b82f6;
      margin-right: 8px;
    }

    .notepad-header span {
      font-weight: 600;
      color: #f1f5f9;
      flex: 1;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .header-actions button {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .header-actions button:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    .notepad-content {
      padding: 20px;
    }

    .notes-textarea {
      width: 100%;
      min-height: 200px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #f1f5f9;
      padding: 12px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .notes-textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .notes-textarea::placeholder {
      color: #64748b;
    }

    .notepad-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }

    .char-count {
      font-size: 12px;
      color: #64748b;
    }

    .share-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .share-btn:hover {
      background: #2563eb;
    }

    @media (max-width: 768px) {
      .notepad-container {
        top: 10px;
        right: 10px;
        width: calc(100vw - 20px);
        max-width: 320px;
      }

      .notepad-container.minimized {
        width: 50px;
        height: 50px;
      }
    }
  `]
})
export class NotepadComponent {
  @Input() notes: string = '';
  @Output() notesChange = new EventEmitter<string>();

  isMinimized = false;

  onNotesChange(notes: string) {
    if (notes.length <= 1000) {
      this.notesChange.emit(notes);
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  clearNotes() {
    this.notes = '';
    this.notesChange.emit('');
  }

  shareNotes() {
    if (this.notes.trim()) {
      navigator.clipboard.writeText(this.notes).then(() => {
        // Could emit a toast notification here
        console.log('Notes copied to clipboard');
      });
    }
  }
}