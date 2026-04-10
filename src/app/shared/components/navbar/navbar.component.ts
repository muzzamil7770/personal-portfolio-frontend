import { Component, Inject, PLATFORM_ID, AfterViewInit, HostListener, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService, SiteData, NavItem } from '../../../core/services/data.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  siteData: SiteData;
  activeLinkIndex = signal(0);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public themeService: ThemeService,
    public uiService: UiService,
    private dataService: DataService
  ) {
    this.siteData = this.dataService.getData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initScrollSpy(), 100); // wait for router-outlet content
    }
  }

  private initScrollSpy(): void {
    const sections = this.siteData.nav.links.map(link => link.href.substring(1));
    const observerOptions: IntersectionObserverInit = {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const navIndex = this.siteData.nav.links.findIndex(link => link.href === `#${id}`);
          if (navIndex !== -1) {
            this.activeLinkIndex.set(navIndex);
          }
        }
      }
    }, observerOptions);

    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });
  }

  openHireMeModal(): void {
    this.uiService.openHireMeModal();
  }
}
