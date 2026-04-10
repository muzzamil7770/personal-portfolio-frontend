import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface CvInfoResponse {
  success: boolean;
  data: {
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    lastModified: string;
    mimeType: string;
  };
}

@Component({
  selector: 'app-cv-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cv-viewer-overlay" *ngIf="isVisible">
      <div class="cv-viewer-container">
        <!-- Header -->
        <div class="cv-header">
          <div class="cv-header-info">
            <h2>📄 My Curriculum Vitae</h2>
            <p>Full Stack Web Developer — Muhammad Muzzamil</p>
          </div>
          <div class="cv-header-actions">
            <button class="btn-close" (click)="close()" title="Close">✕</button>
          </div>
        </div>

        <!-- Download / Loading State -->
        <div class="cv-progress-container" *ngIf="loading || downloadProgress < 100">
          <div class="cv-progress-header">
            <span class="cv-progress-label">
              <ng-container *ngIf="loading && downloadProgress === 0">
                ⏳ Preparing CV for viewing...
              </ng-container>
              <ng-container *ngIf="downloadProgress > 0 && downloadProgress < 100">
                📥 Downloading CV — {{ downloadProgress }}%
              </ng-container>
            </span>
            <span class="cv-progress-bytes" *ngIf="bytesLoaded > 0">
              {{ formatBytes(bytesLoaded) }} / {{ formatBytes(bytesTotal) }}
            </span>
          </div>
          <div class="cv-progress-bar-track">
            <div
              class="cv-progress-bar-fill"
              [style.width.%]="downloadProgress"
              [class.cv-progress-complete]="downloadProgress >= 100"
            ></div>
          </div>
          <!-- Animated dots during loading -->
          <div class="cv-loading-dots" *ngIf="downloadProgress === 0">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <!-- Error State -->
        <div class="cv-error" *ngIf="error">
          <div class="cv-error-icon">⚠️</div>
          <h3>Failed to Load CV</h3>
          <p>{{ error }}</p>
          <button class="btn-retry" (click)="loadCV()">🔄 Retry</button>
        </div>

        <!-- PDF Viewer -->
        <div class="cv-pdf-wrapper" *ngIf="safePdfUrl && downloadProgress >= 100">
          <object
            [data]="safePdfUrl"
            type="application/pdf"
            class="cv-pdf-object"
          >
            <div class="cv-pdf-fallback">
              <p>📄 Your browser doesn't support inline PDF viewing.</p>
              <button class="btn-action btn-download" (click)="downloadCV()">
                📥 Download CV to View
              </button>
            </div>
          </object>
        </div>

        <!-- Footer Actions -->
        <div class="cv-footer-actions" *ngIf="safePdfUrl && downloadProgress >= 100">
          <button class="btn-action btn-download" (click)="downloadCV()">
            📥 Download CV
          </button>
          <button class="btn-action btn-new-tab" (click)="openInNewTab()">
            🔗 Open in New Tab
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cv-viewer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.92);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: cv-fade-in 0.3s ease;
    }
    @keyframes cv-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .cv-viewer-container {
      width: 90vw;
      max-width: 1100px;
      height: 90vh;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.6);
      animation: cv-slide-up 0.35s ease;
    }
    @keyframes cv-slide-up {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Header */
    .cv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .cv-header-info h2 {
      margin: 0;
      color: #f1f5f9;
      font-size: 1.15rem;
      font-weight: 700;
    }
    .cv-header-info p {
      margin: 2px 0 0;
      color: #64748b;
      font-size: 0.8rem;
    }
    .btn-close {
      background: #334155;
      color: #94a3b8;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-close:hover {
      background: #ef4444;
      color: #fff;
    }

    /* Progress Bar */
    .cv-progress-container {
      padding: 1.5rem;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .cv-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .cv-progress-label {
      color: #cbd5e1;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .cv-progress-bytes {
      color: #64748b;
      font-size: 0.8rem;
      font-family: 'Courier New', monospace;
    }
    .cv-progress-bar-track {
      width: 100%;
      height: 8px;
      background: #0f172a;
      border-radius: 4px;
      overflow: hidden;
    }
    .cv-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #818cf8);
      border-radius: 4px;
      transition: width 0.15s ease;
      position: relative;
    }
    .cv-progress-bar-fill::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: cv-shimmer 1.5s infinite;
    }
    @keyframes cv-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .cv-progress-bar-fill.cv-progress-complete {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    /* Loading Dots */
    .cv-loading-dots {
      display: flex;
      gap: 6px;
      justify-content: center;
      margin-top: 12px;
    }
    .cv-loading-dots .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6366f1;
      animation: cv-bounce 1.2s ease-in-out infinite;
    }
    .cv-loading-dots .dot:nth-child(2) { animation-delay: 0.15s; }
    .cv-loading-dots .dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes cv-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Error State */
    .cv-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
    }
    .cv-error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .cv-error h3 {
      color: #f87171;
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
    }
    .cv-error p {
      color: #94a3b8;
      margin: 0 0 1.5rem;
      font-size: 0.9rem;
    }
    .btn-retry {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn-retry:hover {
      background: #4f46e5;
    }

    /* PDF Viewer */
    .cv-pdf-wrapper {
      flex: 1;
      position: relative;
      background: #020617;
      min-height: 0;
      overflow: hidden;
    }
    .cv-pdf-object {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    .cv-pdf-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      text-align: center;
      padding: 2rem;
    }
    .cv-pdf-fallback p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    /* Footer Actions */
    .cv-footer-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      padding: 1rem 1.5rem;
      background: #1e293b;
      border-top: 1px solid #334155;
    }
    .btn-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.6rem 1.3rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-download {
      background: #6366f1;
      color: #fff;
    }
    .btn-download:hover {
      background: #4f46e5;
      transform: translateY(-1px);
    }
    .btn-new-tab {
      background: #334155;
      color: #cbd5e1;
    }
    .btn-new-tab:hover {
      background: #475569;
      color: #f1f5f9;
      transform: translateY(-1px);
    }
  `]
})
export class CvViewerComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  isVisible = true;
  loading = true;
  downloadProgress = 0;
  bytesLoaded = 0;
  bytesTotal = 0;
  error: string | null = null;
  pdfDataUrl: string | null = null;
  safePdfUrl: SafeResourceUrl | null = null;
  cvInfo: CvInfoResponse['data'] | null = null;
  private blob: Blob | null = null;
  private sanitizer = inject<DomSanitizer>(DomSanitizer);

  ngOnInit() {
    this.loadCV();
  }

  async loadCV() {
    this.loading = true;
    this.downloadProgress = 0;
    this.bytesLoaded = 0;
    this.bytesTotal = 0;
    this.error = null;
    this.pdfDataUrl = null;
    this.safePdfUrl = null;
    this.cvInfo = null;

    try {
      // First get file info to know total size
      const infoRes = await fetch(`${environment.apiUrl}/cv/info`);
      const infoData = await infoRes.json();

      if (!infoData.success) {
        throw new Error(infoData.message || 'Failed to get CV info');
      }

      this.bytesTotal = infoData.data.fileSize;

      // Use SSE (Server-Sent Events) base64 endpoint to avoid IDM interception
      const evtSource = new EventSource(`${environment.apiUrl}/cv/base64`);

      evtSource.onmessage = (event) => {
        // Check for done signal
        if (event.data === '[DONE]') {
          evtSource.close();
          return;
        }

        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'progress') {
            this.downloadProgress = msg.percent;
            this.bytesLoaded = msg.loaded;
            this.bytesTotal = msg.total;
          }

          if (msg.type === 'complete') {
            // Convert base64 to data URL for reliable PDF rendering
            try {
              const dataUrl = 'data:application/pdf;base64,' + msg.base64;
              this.pdfDataUrl = dataUrl;
              this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
              this.downloadProgress = 100;
              this.loading = false;

              // Also create blob for download functionality
              const byteCharacters = atob(msg.base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              this.blob = new Blob([byteArray], { type: 'application/pdf' });

              if (this.blob.size === 0) {
                throw new Error('Received empty PDF');
              }
            } catch (err: any) {
              this.error = 'Failed to process CV: ' + err.message;
              this.loading = false;
            }
            evtSource.close();
          }

          if (msg.type === 'error') {
            throw new Error(msg.message || 'Server error while reading CV');
          }
        } catch (parseErr: any) {
          this.error = parseErr.message || 'Failed to parse CV data';
          this.loading = false;
          evtSource.close();
        }
      };

      evtSource.onerror = () => {
        this.error = 'Connection lost while loading CV. Please try again.';
        this.loading = false;
        evtSource.close();
      };
    } catch (err: any) {
      this.error = err.message || 'Failed to load CV. Please try again.';
      this.loading = false;
      this.downloadProgress = 0;
    }
  }

  downloadCV() {
    if (!this.blob) return;

    const url = URL.createObjectURL(this.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MUZZAMIL_Full_Stack_Web_Developer.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  openInNewTab() {
    if (!this.pdfDataUrl) return;
    window.open(this.pdfDataUrl, '_blank');
  }

  close() {
    this.pdfDataUrl = null;
    this.safePdfUrl = null;
    this.blob = null;
    this.isVisible = false;
    this.closed.emit();
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
