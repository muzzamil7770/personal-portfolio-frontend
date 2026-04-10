import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/services/theme.service';
import { UiService } from './core/services/ui.service';
import { DataService, SiteData } from './core/services/data.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { MobileMenuComponent } from './shared/components/mobile-menu/mobile-menu.component';
import { ScrollProgressComponent } from './shared/components/scroll-progress/scroll-progress.component';
import { NavArrowsComponent } from './shared/components/nav-arrows/nav-arrows.component';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';
import { ProjectModalComponent } from './shared/components/modals/project-modal.component';
import { BlogModalComponent } from './shared/components/modals/blog-modal.component';
import { HireMeModalComponent } from './shared/components/modals/hire-me-modal.component';
import { ProjectPreviewModalComponent } from './shared/components/modals/project-preview-modal.component';
import { UpworkWidgetComponent } from './shared/components/upwork-widget/upwork-widget.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { CooldownOverlayComponent } from './shared/components/cooldown-overlay/cooldown-overlay.component';
import { AdminPanelStripComponent } from './shared/components/admin-panel-strip/admin-panel-strip.component';
import { PortfolioProjectSidebarComponent } from './shared/components/portfolio-project-sidebar/portfolio-project-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    MobileMenuComponent,
    ScrollProgressComponent,
    NavArrowsComponent,
    ScrollToTopComponent,
    ProjectModalComponent,
    BlogModalComponent,
    HireMeModalComponent,
    ProjectPreviewModalComponent,
    UpworkWidgetComponent,
    FooterComponent,
    ToastComponent,
    CooldownOverlayComponent,
    AdminPanelStripComponent,
    PortfolioProjectSidebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  siteData: SiteData;
  isAdmin = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private themeService: ThemeService,
    private uiService: UiService,
    private dataService: DataService,
    private router: Router
  ) {
    this.siteData = this.dataService.getData();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.themeService.initTheme();
    }
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdmin = e.urlAfterRedirects.startsWith('/admin');
    });
  }

  openHireMeModal(): void {
    this.uiService.openHireMeModal();
  }
}
