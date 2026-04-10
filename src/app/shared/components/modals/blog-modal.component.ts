import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UiService, BlogPost } from '../../../core/services/ui.service';

@Component({
  selector: 'app-blog-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" [class.active]="(uiService.blogModalOpen$ | async)" (click)="closeOnBackdrop($event)">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedPost?.title }}</h2>
          <button class="modal-close" aria-label="Close modal" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" *ngIf="selectedPost">
          <img [src]="selectedPost.image" [alt]="selectedPost.title" class="modal-image" />

          <div class="modal-blog-meta">
            <span><i class="fas fa-calendar"></i> {{ selectedPost.date }}</span>
            <span><i class="fas fa-tag"></i> {{ selectedPost.category }}</span>
            <span><i class="fas fa-clock"></i> {{ selectedPost.readTime }}</span>
          </div>

          <div class="modal-blog-content">
            <ng-container *ngFor="let para of selectedPost.content">
              <h3 *ngIf="para.startsWith('###')">{{ para.replace('### ', '') }}</h3>
              <p *ngIf="!para.startsWith('###')">{{ para }}</p>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['']
})
export class BlogModalComponent {
  selectedPost: BlogPost | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public uiService: UiService
  ) {
    this.uiService.selectedBlogPost$.subscribe(post => {
      this.selectedPost = post;
    });
  }

  closeModal(): void {
    this.uiService.closeBlogModal();
  }

  closeOnBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
