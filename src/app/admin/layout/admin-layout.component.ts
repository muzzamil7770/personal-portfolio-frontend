import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="brand">
          <i class="fas fa-bolt brand-icon"></i>
          <span>Admin Panel</span>
        </div>
        <nav>
          <a routerLink="contacts" routerLinkActive="active">
            <i class="fas fa-envelope"></i> Contacts
          </a>
          <a routerLink="hires" routerLinkActive="active">
            <i class="fas fa-briefcase"></i> Hire Requests
          </a>
          <a routerLink="analytics" routerLinkActive="active">
            <i class="fas fa-chart-bar"></i> Analytics
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="theme-row" (click)="themeService.toggleTheme()" title="Toggle theme">
            <div class="theme-toggle">
              <div class="theme-toggle-circle">
                <i class="fas fa-moon"></i>
              </div>
            </div>
            <span class="theme-label">Toggle Theme</span>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-shell { display: flex; min-height: 100vh; background: var(--bg-primary); }
    .sidebar {
      width: 220px; background: var(--bg-secondary); border-right: 1px solid var(--border-color);
      display: flex; flex-direction: column; padding: 1.5rem 1rem;
      position: sticky; top: 0; height: 100vh; flex-shrink: 0;
    }
    .brand {
      display: flex; align-items: center; gap: 8px; color: var(--primary);
      font-size: 1.1rem; font-weight: 700; margin-bottom: 2rem; padding: 0 0.5rem;
    }
    .brand-icon { font-size: 1.1rem; }
    nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    nav a {
      display: flex; align-items: center; gap: 10px; padding: 0.65rem 0.75rem;
      border-radius: 8px; color: var(--text-secondary); text-decoration: none; font-size: 0.875rem;
      transition: all 0.2s; font-weight: 500;
    }
    nav a i { width: 16px; text-align: center; color: var(--text-muted); transition: color 0.2s; }
    nav a:hover { background: var(--primary-100); color: var(--primary); }
    nav a:hover i { color: var(--primary); }
    nav a.active { background: var(--primary); color: #fff; }
    nav a.active i { color: #fff; }
    .sidebar-footer { display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .theme-row {
      display: flex; align-items: center; gap: 10px; padding: 0.5rem 0.75rem;
      border-radius: 8px; cursor: pointer; transition: background 0.2s;
    }
    .theme-row:hover { background: var(--primary-100); }
    .theme-toggle {
      width: 40px; height: 22px; background: var(--primary);
      border-radius: 999px; position: relative; flex-shrink: 0;
    }
    .theme-toggle-circle {
      position: absolute; top: 2px; left: 2px;
      width: 18px; height: 18px; background: #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; color: var(--primary);
      transition: transform 0.25s ease;
    }
    body.light .theme-toggle-circle { transform: translateX(18px); }
    .theme-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
    .logout-btn {
      display: flex; align-items: center; gap: 8px;
      background: none; border: 1px solid var(--border-color); color: var(--text-muted);
      padding: 0.6rem 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem;
      transition: all 0.2s; width: 100%;
    }
    .logout-btn:hover { border-color: #f87171; color: #f87171; }
    .content { flex: 1; padding: 2rem; overflow: visible; position: relative; }
  `]
})
export class AdminLayoutComponent {
  constructor(private router: Router, public themeService: ThemeService) {}
  logout() {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_token');
    this.router.navigate(['/admin'], { replaceUrl: true });
  }
}
