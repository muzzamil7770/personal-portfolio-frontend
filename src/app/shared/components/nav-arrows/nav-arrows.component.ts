import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nav-arrows',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nav-arrows">
      <button id="prev-section" class="nav-arrow" title="Previous Section" aria-label="Previous section" (click)="navigateSection('prev')">
        <i class="fas fa-chevron-up"></i>
      </button>
      <button id="next-section" class="nav-arrow" title="Next Section" aria-label="Next section" (click)="navigateSection('next')">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
  `,
  styles: ['']
})
export class NavArrowsComponent {
  private mainSectionIds = ['home', 'about', 'skills', 'experience', 'education', 'services', 'projects', 'testimonials', 'blog', 'contact'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  navigateSection(direction: 'prev' | 'next'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const activeLink = document.querySelector('.nav-link.active');
    if (!activeLink) return;

    const currentId = activeLink.getAttribute('href')?.substring(1);
    const currentIndex = this.mainSectionIds.indexOf(currentId || '');

    if (direction === 'prev' && currentIndex > 0) {
      document.getElementById(this.mainSectionIds[currentIndex - 1])?.scrollIntoView({ behavior: 'smooth' });
    } else if (direction === 'next' && currentIndex < this.mainSectionIds.length - 1) {
      document.getElementById(this.mainSectionIds[currentIndex + 1])?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
