import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button id="scroll-to-top" class="scroll-top" [class.visible]="isVisible" title="Scroll to Top" aria-label="Scroll to top" (click)="scrollToTop()">
      <i class="fas fa-arrow-up"></i>
    </button>
  `,
  styles: ['']
})
export class ScrollToTopComponent implements AfterViewInit {
  isVisible = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.isVisible = window.scrollY > 400;
      }, { passive: true });
    }
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
