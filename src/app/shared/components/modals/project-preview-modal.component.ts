import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UiService, Project } from '../../../core/services/ui.service';

@Component({
  selector: 'app-project-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-preview-modal" [class.active]="(uiService.projectPreviewOpen$ | async)" (click)="closeOnBackdrop($event)">
      <button class="preview-close" aria-label="Close preview" (click)="closePreview()">
        <i class="fas fa-times"></i>
      </button>
      <div class="project-preview-container" *ngIf="selectedProject">
        <img [src]="selectedProject.image" [alt]="selectedProject.title" class="project-preview-image" 
             [style.transform]="'scale(' + currentZoom + ')'" (click)="toggleZoom()" />
        <div class="project-preview-info">
          <h2 class="project-preview-title">{{ selectedProject.title }}</h2>
          <p class="project-preview-description">{{ selectedProject.description }}</p>
          <div class="project-preview-tech">
            <span *ngFor="let tech of selectedProject.techs">{{ tech }}</span>
          </div>
          <div class="project-preview-actions">
            <button class="btn btn-primary" (click)="closePreview(); openProjectModal(selectedProject!);">
              <i class="fas fa-info-circle"></i>
              <span>View Full Details</span>
            </button>
          </div>
        </div>
      </div>
      <div class="preview-zoom-controls">
        <button class="zoom-btn" aria-label="Zoom in" (click)="zoomIn()">
          <i class="fas fa-plus"></i>
        </button>
        <button class="zoom-btn" aria-label="Zoom out" (click)="zoomOut()">
          <i class="fas fa-minus"></i>
        </button>
        <button class="zoom-btn" aria-label="Reset zoom" (click)="zoomReset()">
          <i class="fas fa-compress"></i>
        </button>
      </div>
    </div>
  `,
  styles: ['']
})
export class ProjectPreviewModalComponent {
  selectedProject: Project | null = null;
  currentZoom = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public uiService: UiService
  ) {
    this.uiService.selectedPreviewProject$.subscribe(project => {
      this.selectedProject = project;
    });
  }

  closePreview(): void {
    this.currentZoom = 1;
    this.uiService.closeProjectPreview();
  }

  closeOnBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('project-preview-modal')) {
      this.closePreview();
    }
  }

  toggleZoom(): void {
    this.currentZoom = this.currentZoom === 1 ? 1.5 : 1;
  }

  zoomIn(): void {
    this.currentZoom = Math.min(this.currentZoom + 0.25, 3);
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.currentZoom - 0.25, 0.5);
  }

  zoomReset(): void {
    this.currentZoom = 1;
  }

  openProjectModal(project: Project): void {
    this.uiService.openProjectModal(project);
  }
}
