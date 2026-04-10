import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService, SiteData } from '../../../core/services/data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">{{ siteData.footer.name }}</div>
          <p class="footer-description">{{ siteData.footer.description }}</p>

          <div class="footer-social">
            <a [href]="'https://github.com/' + siteData.footer.github" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i class="fab fa-github"></i>
            </a>
            <a [href]="'https://www.linkedin.com/in/' + siteData.footer.linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i class="fab fa-linkedin"></i>
            </a>
            <a [href]="'https://wa.me/' + siteData.footer.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
            <a [href]="'mailto:' + siteData.footer.email" aria-label="Email">
              <i class="fas fa-envelope"></i>
            </a>
          </div>

          <p class="footer-copyright">
            &copy; {{ getCurrentYear() }} {{ siteData.footer.name }}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: ['']
})
export class FooterComponent {
  siteData: SiteData;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataService: DataService
  ) {
    this.siteData = this.dataService.getData();
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
