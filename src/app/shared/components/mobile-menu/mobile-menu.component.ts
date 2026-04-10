import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';
import { DataService, SiteData } from '../../../core/services/data.service';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mobile-menu" [class.active]="(uiService.mobileMenuOpen$ | async)">
      @for (link of siteData.nav.links; track link.href) {
        <a [href]="link.href" class="nav-link" (click)="uiService.closeMobileMenu()">{{ link.label }}</a>
      }
      <a href="#hire" class="nav-link" style="background: var(--primary); color: #ffffff; font-weight: 600; margin-top: 0.5rem;" 
         (click)="uiService.openHireMeModal(); uiService.closeMobileMenu(); $event.preventDefault()">
        Hire Me
      </a>
    </div>
  `,
  styles: ['']
})
export class MobileMenuComponent {
  siteData: SiteData;

  constructor(
    public uiService: UiService,
    private dataService: DataService
  ) {
    this.siteData = this.dataService.getData();
  }
}
