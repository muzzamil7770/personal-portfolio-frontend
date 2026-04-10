import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UiService, Project } from '../../../core/services/ui.service';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" [class.active]="(uiService.projectModalOpen$ | async)" (click)="closeOnBackdrop($event)">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedProject?.detailTitle }}</h2>
          <button class="modal-close" aria-label="Close modal" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" *ngIf="selectedProject">
          <img [src]="selectedProject.image" [alt]="selectedProject.detailTitle" class="modal-image" />

          <p class="modal-description">{{ selectedProject.detailDescription }}</p>

          <div class="modal-section">
            <h3 class="modal-section-title"><i class="fas fa-project-diagram" style="margin-right: 8px; color: var(--primary);"></i>Project Flow</h3>
            <ol class="modal-features" style="list-style: none; counter-reset: item;">
              <li *ngFor="let step of selectedProject.projectFlow; let i = index" style="counter-increment: item; position: relative; padding-left: 32px;">
                <span style="position: absolute; left: 0; top: 2px; width: 24px; height: 24px; background: var(--primary-100); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">{{ i + 1 }}</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>

          <div class="modal-section">
            <h3 class="modal-section-title"><i class="fas fa-star" style="margin-right: 8px; color: var(--primary);"></i>Key Features</h3>
            <ul class="modal-features">
              <li *ngFor="let feature of selectedProject.features">
                <i class="fas fa-check-circle"></i>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <div class="modal-section">
            <h3 class="modal-section-title"><i class="fas fa-cogs" style="margin-right: 8px; color: var(--primary);"></i>How It Works</h3>
            <p style="color: var(--text-secondary); line-height: 1.75; font-size: 0.9375rem;">{{ selectedProject.howItWorks }}</p>
          </div>

          <div class="modal-section">
            <h3 class="modal-section-title"><i class="fas fa-code" style="margin-right: 8px; color: var(--primary);"></i>Methods & Technologies Used</h3>
            <ul class="modal-features">
              <li *ngFor="let method of selectedProject.methodsUsed">
                <i class="fas fa-angle-right"></i>
                <span>{{ method }}</span>
              </li>
            </ul>
          </div>

          <div class="modal-section">
            <h3 class="modal-section-title"><i class="fas fa-trophy" style="margin-right: 8px; color: var(--primary);"></i>Developer Strengths Demonstrated</h3>
            <ul class="modal-features">
              <li *ngFor="let strength of selectedProject.strengths">
                <i class="fas fa-bolt"></i>
                <span>{{ strength }}</span>
              </li>
            </ul>
          </div>

          <div class="modal-section">
            <h3 class="modal-section-title"><i class="fas fa-layer-group" style="margin-right: 8px; color: var(--primary);"></i>Technologies Used</h3>
            <div class="modal-tech-stack">
              <span *ngFor="let tech of selectedProject.techStack">{{ tech.name }}</span>
            </div>
          </div>

          <div class="modal-section" *ngIf="selectedProject.images.length > 0">
            <h3 class="modal-section-title"><i class="fas fa-images" style="margin-right: 8px; color: var(--primary);"></i>Project Screenshots</h3>
            <div class="modal-screenshots">
              <div class="modal-screenshot" *ngFor="let img of selectedProject.images">
                <img [src]="img" [alt]="selectedProject.detailTitle" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['']
})
export class ProjectModalComponent {
  selectedProject: Project | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public uiService: UiService
  ) {
    this.uiService.selectedProject$.subscribe(project => {
      this.selectedProject = project;
    });
  }

  closeModal(): void {
    this.uiService.closeProjectModal();
  }

  closeOnBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
