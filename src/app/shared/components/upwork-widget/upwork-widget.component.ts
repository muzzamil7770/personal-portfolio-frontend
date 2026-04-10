import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-upwork-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upwork-widget" id="upwork-widget">
      <button class="upwork-toggle" [class.active]="(uiService.upworkPopupOpen$ | async)" aria-label="Toggle Upwork services" (click)="togglePopup()">
        <i class="fas fa-briefcase"></i>
      </button>
      <div class="upwork-popup" [class.active]="(uiService.upworkPopupOpen$ | async)">
        <div class="upwork-popup-header">
          <div class="upwork-logo">
            <i class="fas fa-check"></i>
          </div>
          <div>
            <div class="upwork-popup-title">Hire Me on Upwork</div>
          </div>
        </div>
        <p class="upwork-popup-description">
          Top-rated Angular Developer with proven track record. View my services and client testimonials.
        </p>
        <div class="upwork-services-list">
          <a href="https://www.upwork.com/freelancers/~0120e689809e4af148?s=1110580755057594368" target="_blank" rel="noopener noreferrer" class="upwork-service-link">
            <i class="fab fa-angular"></i>
            <span>Angular Development</span>
          </a>
          <a href="https://www.upwork.com/services/product/development-it-pixel-perfect-frontend-development-landing-pages-dashboards-ecommerce-ui-1897293584935730010?ref=fl_profile" target="_blank" rel="noopener noreferrer" class="upwork-service-link">
            <i class="fas fa-code"></i>
            <span>Full-Stack Development</span>
          </a>
          <a href="https://www.upwork.com/services/product/development-it-pixel-perfect-frontend-development-in-tailwind-css-angular-react-1921608291601283435?image=1925619251159838711" target="_blank" rel="noopener noreferrer" class="upwork-service-link">
            <i class="fas fa-mobile-alt"></i>
            <span>Responsive Web Design</span>
          </a>
          <a href="https://www.upwork.com/services/product/development-it-a-fast-secure-backend-with-api-endpoints-and-mysql-database-ready-to-scale-2041917207489755633?image=2041925709301265954" target="_blank" rel="noopener noreferrer" class="upwork-service-link">
            <i class="fas fa-tachometer-alt"></i>
            <span>Performance Optimization</span>
          </a>
        </div>
        <a href="https://www.upwork.com/freelancers/~0120e689809e4af148" target="_blank" rel="noopener noreferrer" class="upwork-hire-btn">
          <i class="fas fa-external-link-alt"></i>
          <span>View Profile & Hire Now</span>
        </a>
      </div>
    </div>
  `,
  styles: ['']
})
export class UpworkWidgetComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public uiService: UiService
  ) {}

  togglePopup(): void {
    this.uiService.toggleUpworkPopup();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const widget = document.getElementById('upwork-widget');
    if (widget && !widget.contains(event.target as Node)) {
      this.uiService.closeUpworkPopup();
    }
  }
}
