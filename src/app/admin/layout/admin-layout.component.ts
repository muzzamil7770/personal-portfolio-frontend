import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, THEMES, AppTheme } from '../../core/services/theme.service';
import { CookieService } from '../../core/services/cookie.service';
import { HealthService, SystemHealth } from '../../core/services/health.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <!-- Mobile top bar -->
    <div class="mob-bar">
      <button class="mob-hamburger" (click)="sidebarOpen = !sidebarOpen" aria-label="Menu">
        <span [class.open]="sidebarOpen"></span>
        <span [class.open]="sidebarOpen"></span>
        <span [class.open]="sidebarOpen"></span>
      </button>
      <div class="mob-brand"><i class="fas fa-bolt"></i> Admin Panel</div>
      <button class="mob-theme" (click)="themeService.toggleTheme()" aria-label="Toggle theme">
        <i class="fas fa-moon"></i>
      </button>
    </div>

    <!-- Backdrop -->
    <div class="sb-backdrop" [class.visible]="sidebarOpen" (click)="sidebarOpen = false"></div>

    <div class="admin-shell">
      <aside class="sidebar" 
             [class.open]="sidebarOpen" 
             [class.collapsed]="!isSidebarHovered && !sidebarOpen"
             (mouseenter)="onSidebarHover(true)"
             (mouseleave)="onSidebarHover(false)">
        <div class="brand">
          <i class="fas fa-bolt brand-icon"></i>
          <span class="brand-text">Admin Panel</span>
        </div>
        <nav>
          <a routerLink="contacts" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-envelope"></i> <span>Contacts</span>
          </a>
          <a routerLink="hires" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-briefcase"></i> <span>Hire Requests</span>
          </a>
          <a routerLink="analytics" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-chart-bar"></i> <span>Analytics</span>
          </a>
          <a routerLink="ai-stats" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-robot"></i> <span>AI Chatbot</span>
          </a>
          <a routerLink="conversations" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-comments"></i> <span>Conversations</span>
          </a>
          <a routerLink="calendar" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-calendar-alt"></i> <span>Calendar</span>
          </a>
          <a routerLink="video-call" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="fas fa-video"></i> <span>Video Call</span>
          </a>
        </nav>

        <!-- System Health -->
        <div class="health-section">
          <div class="health-label" *ngIf="!(!isSidebarHovered && !sidebarOpen)">
            <i class="fas fa-heartbeat"></i> Connections
          </div>
          <div class="health-grid" *ngIf="health">
            <div class="health-item" title="Firebase Status">
              <span class="status-dot" [class]="health.firebase"></span>
              <span class="health-name" *ngIf="!(!isSidebarHovered && !sidebarOpen)">Firebase</span>
            </div>
            <div class="health-item" title="API Status">
              <span class="status-dot" [class]="health.api"></span>
              <span class="health-name" *ngIf="!(!isSidebarHovered && !sidebarOpen)">Server API</span>
            </div>
            <div class="health-item" title="Socket Status">
              <span class="status-dot" [class]="health.socket"></span>
              <span class="health-name" *ngIf="!(!isSidebarHovered && !sidebarOpen)">Socket</span>
            </div>
          </div>
        </div>

        <!-- Theme Picker -->
        <div class="theme-section">
          <div class="theme-section-label">
            <i class="fas fa-palette"></i> Theme
          </div>
          <div class="theme-grid">
            <button
              *ngFor="let t of themes"
              class="theme-chip"
              [class.active]="currentTheme === t.id"
              [attr.data-theme]="t.id"
              [title]="t.label"
              (click)="applyTheme(t)">
              <i [class]="t.icon"></i>
              <span>{{ t.label }}</span>
            </button>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    /* Mobile top bar */
    .mob-bar {
      display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 1100;
      height: 56px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);
      align-items: center; justify-content: space-between; padding: 0 1rem;
    }
    @media(max-width:768px) { .mob-bar { display: flex; } }
    .mob-hamburger {
      width: 36px; height: 36px; background: none; border: none;
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; gap: 5px; cursor: pointer; padding: 4px;
    }
    .mob-hamburger span {
      display: block; width: 20px; height: 2px;
      background: var(--text-secondary); border-radius: 2px;
      transition: all 0.3s ease; transform-origin: center;
    }
    .mob-hamburger span:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
    .mob-hamburger span:nth-child(2).open { opacity: 0; transform: scaleX(0); }
    .mob-hamburger span:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }
    .mob-brand { color: var(--primary); font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 6px; }
    .mob-theme {
      width: 36px; height: 36px; background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: 8px; color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }

    /* Backdrop */
    .sb-backdrop { display: none; position: fixed; inset: 0; z-index: 1099; background: rgba(0,0,0,0.55); backdrop-filter: blur(3px); }
    @media(max-width:768px) {
      .sb-backdrop { display: block; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .sb-backdrop.visible { opacity: 1; pointer-events: all; }
    }

    /* Shell */
    .admin-shell { display: flex; min-height: 100vh; background: var(--bg-primary); }
    @media(max-width:768px) { .admin-shell { padding-top: 56px; } }

    /* Sidebar */
    .sidebar {
      width: 240px; background: var(--bg-secondary); border-right: 1px solid var(--border-color);
      display: flex; flex-direction: column; padding: 1.5rem 0.75rem;
      position: sticky; top: 0; height: 100vh; flex-shrink: 0; overflow-y: auto;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: hidden;
    }
    .sidebar.collapsed { width: 70px; padding: 1.5rem 0.5rem; }
    .sidebar::-webkit-scrollbar { width: 3px; }
    .sidebar::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 2px; }
    
    @media(max-width:768px) {
      .sidebar {
        position: fixed; top: 56px; left: 0; bottom: 0; z-index: 1100;
        transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        height: calc(100vh - 56px); width: 240px !important;
      }
      .sidebar.open { transform: translateX(0); }
    }

    .brand {
      display: flex; align-items: center; gap: 12px; color: var(--primary);
      font-size: 1.1rem; font-weight: 700; margin-bottom: 2rem; padding: 0 0.75rem;
      white-space: nowrap;
    }
    .brand-text { transition: opacity 0.2s; }
    .sidebar.collapsed .brand-text { opacity: 0; pointer-events: none; }
    @media(max-width:768px) { .brand { display: none; } }

    nav { display: flex; flex-direction: column; gap: 4px; }
    nav a {
      display: flex; align-items: center; gap: 12px; padding: 0.75rem;
      border-radius: 8px; color: var(--text-secondary); text-decoration: none;
      font-size: 0.875rem; transition: all 0.2s; font-weight: 500;
      white-space: nowrap; overflow: hidden;
    }
    nav a i { width: 20px; text-align: center; color: var(--text-muted); transition: color 0.2s; flex-shrink: 0; }
    nav a span { transition: opacity 0.2s; }
    .sidebar.collapsed nav a span { opacity: 0; }

    .theme-section {
      margin-top: 1.25rem; padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      transition: opacity 0.2s;
    }
    .sidebar.collapsed .theme-section { opacity: 0; pointer-events: none; }
    .theme-section-label {
      display: flex; align-items: center; gap: 6px;
      color: var(--text-muted); font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem;
    }
    .theme-section-label i { color: var(--primary); font-size: 0.75rem; }
    .theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .theme-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 8px; border-radius: 7px; border: 1.5px solid var(--border-color);
      background: var(--bg-tertiary); color: var(--text-muted);
      cursor: pointer; font-size: 0.72rem; font-weight: 600;
      transition: all 0.18s; font-family: inherit;
    }
    .theme-chip i { font-size: 0.7rem; }
    .theme-chip:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-100); }
    .theme-chip.active {
      border-color: var(--primary); background: var(--primary);
      color: #fff; box-shadow: 0 2px 8px var(--primary-200);
    }

    /* Footer */
    .sidebar-footer {
      display: flex; flex-direction: column; gap: 8px;
      margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color);
    }
    .logout-btn {
      display: flex; align-items: center; gap: 12px;
      background: none; border: 1px solid var(--border-color); color: var(--text-muted);
      padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem;
      transition: all 0.2s; width: 100%; white-space: nowrap; overflow: hidden;
    }
    .logout-btn span { transition: opacity 0.2s; }
    .sidebar.collapsed .logout-btn { border-color: transparent; }
    .sidebar.collapsed .logout-btn span { opacity: 0; }
    .logout-btn:hover { border-color: #f87171; color: #f87171; }

    /* Content */
    .content { flex: 1; padding: 2rem; overflow: visible; position: relative; min-width: 0; }
    @media(max-width:768px) { .content { padding: 1rem; } }
    @media(max-width:480px) { .content { padding: 0.75rem; } }

    /* Health Section */
    .health-section {
      margin-top: 1.5rem; padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      transition: all 0.2s;
    }
    .health-label {
      color: var(--text-muted); font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem;
      display: flex; align-items: center; gap: 6px;
    }
    .health-label i { color: var(--primary); font-size: 0.75rem; }
    .health-grid { display: flex; flex-direction: column; gap: 10px; }
    .health-item { display: flex; align-items: center; gap: 10px; cursor: default; }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 0 0 rgba(0,0,0,0); transition: all 0.3s;
    }
    .status-dot.online { background: var(--success); box-shadow: 0 0 8px rgba(34,197,94,0.4); }
    .status-dot.offline { background: var(--error); box-shadow: 0 0 8px rgba(239,68,68,0.4); }
    .status-dot.pending { background: var(--warning); animation: pulse-status 1.5s infinite; }
    @keyframes pulse-status { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    .health-name { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
    .sidebar.collapsed .health-item { justify-content: center; }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  isSidebarHovered = false;
  themes: AppTheme[] = THEMES;
  currentTheme = 'dark';
  health?: SystemHealth;
  private healthSub?: Subscription;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private cookieService: CookieService,
    private healthService: HealthService
  ) { }

  ngOnInit() {
    this.healthSub = this.healthService.health$.subscribe(h => this.health = h);
    this.themeService.current$.subscribe(id => this.currentTheme = id);
  }

  ngOnDestroy() {
    this.healthSub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.sidebarOpen = false; }

  applyTheme(t: AppTheme) {
    this.themeService.setTheme(t.id);
    this.currentTheme = t.id;
  }

  logout() {
    this.cookieService.delete('admin_auth');
    this.cookieService.delete('admin_token');
    this.router.navigate(['/admin'], { replaceUrl: true });
  }

  onSidebarHover(isHovered: boolean) {
    if (window.innerWidth > 768) {
      this.isSidebarHovered = isHovered;
    }
  }
}
