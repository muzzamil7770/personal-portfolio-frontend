import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-portfolio-project-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div class="sidebar-backdrop"
         [class.active]="uiService.portfolioSidebarOpen$ | async"
         (click)="uiService.closePortfolioSidebar()">
    </div>

    <!-- Sidebar Drawer -->
    <aside class="portfolio-sidebar" [class.open]="uiService.portfolioSidebarOpen$ | async" role="dialog" aria-label="Portfolio Project Details">

      <!-- Header -->
      <div class="sb-header">
        <div class="sb-header-left">
          <div class="sb-badge"><i class="fas fa-layer-group"></i> Full-Stack Project</div>
          <h2 class="sb-title">Personal Portfolio</h2>
          <p class="sb-subtitle">Angular 17 + Express.js</p>
        </div>
        <button class="sb-close" (click)="uiService.closePortfolioSidebar()" aria-label="Close sidebar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="sb-body">

        <!-- Summary -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fas fa-info-circle"></i> Project Summary</h3>
          <p class="sb-text">
            A production-ready personal portfolio built as a full-stack application. The Angular 17 frontend delivers a
            blazing-fast SPA with standalone components, reactive forms, and a rich UI. The Express.js backend handles
            contact/hire form submissions, CV downloads, admin authentication with 2FA, analytics tracking, and
            rate-limited email delivery via Nodemailer.
          </p>
          <div class="sb-stats-row">
            <div class="sb-stat"><span class="sb-stat-val">Angular 17</span><span class="sb-stat-lbl">Frontend</span></div>
            <div class="sb-stat"><span class="sb-stat-val">Express.js</span><span class="sb-stat-lbl">Backend</span></div>
            <div class="sb-stat"><span class="sb-stat-val">JSON DB</span><span class="sb-stat-lbl">Storage</span></div>
            <div class="sb-stat"><span class="sb-stat-val">Netlify</span><span class="sb-stat-lbl">Deployed</span></div>
          </div>
        </section>

        <!-- Web Flow Diagram -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fas fa-project-diagram"></i> Web Flow Diagram</h3>
          <div class="flow-diagram">

            <div class="flow-row">
              <div class="flow-node node-client">
                <i class="fas fa-globe"></i>
                <span>Browser / User</span>
              </div>
            </div>
            <div class="flow-arrow-down"><i class="fas fa-arrow-down"></i></div>

            <div class="flow-row">
              <div class="flow-node node-frontend">
                <i class="fab fa-angular"></i>
                <span>Angular 17 SPA</span>
                <small>Standalone Components · RxJS · Reactive Forms</small>
              </div>
            </div>

            <div class="flow-split-label">HTTP Requests via Angular HttpClient</div>
            <div class="flow-split-row">
              <div class="flow-split-line"></div>
              <div class="flow-split-arrows">
                <div class="flow-arrow-down small"><i class="fas fa-arrow-down"></i></div>
                <div class="flow-arrow-down small"><i class="fas fa-arrow-down"></i></div>
                <div class="flow-arrow-down small"><i class="fas fa-arrow-down"></i></div>
                <div class="flow-arrow-down small"><i class="fas fa-arrow-down"></i></div>
              </div>
            </div>

            <div class="flow-row flow-row-multi">
              <div class="flow-node node-route">
                <i class="fas fa-envelope"></i>
                <span>/api/contact</span>
              </div>
              <div class="flow-node node-route">
                <i class="fas fa-briefcase"></i>
                <span>/api/hire</span>
              </div>
              <div class="flow-node node-route">
                <i class="fas fa-file-pdf"></i>
                <span>/api/cv</span>
              </div>
              <div class="flow-node node-route">
                <i class="fas fa-chart-bar"></i>
                <span>/api/analytics</span>
              </div>
            </div>
            <div class="flow-arrow-down"><i class="fas fa-arrow-down"></i></div>

            <div class="flow-row flow-row-multi">
              <div class="flow-node node-middleware">
                <i class="fas fa-shield-alt"></i>
                <span>Helmet + CORS</span>
              </div>
              <div class="flow-node node-middleware">
                <i class="fas fa-tachometer-alt"></i>
                <span>Rate Limiter</span>
              </div>
              <div class="flow-node node-middleware">
                <i class="fas fa-check-circle"></i>
                <span>Joi Validator</span>
              </div>
              <div class="flow-node node-middleware">
                <i class="fas fa-lock"></i>
                <span>JWT Auth</span>
              </div>
            </div>
            <div class="flow-arrow-down"><i class="fas fa-arrow-down"></i></div>

            <div class="flow-row flow-row-multi">
              <div class="flow-node node-service">
                <i class="fas fa-paper-plane"></i>
                <span>Email Service</span>
                <small>Nodemailer + HTML Templates</small>
              </div>
              <div class="flow-node node-service">
                <i class="fas fa-key"></i>
                <span>2FA Service</span>
                <small>TOTP Verification</small>
              </div>
              <div class="flow-node node-service">
                <i class="fas fa-database"></i>
                <span>JSON DB</span>
                <small>db.json · logs_db.json</small>
              </div>
            </div>
            <div class="flow-arrow-down"><i class="fas fa-arrow-down"></i></div>

            <div class="flow-row">
              <div class="flow-node node-auth">
                <i class="fas fa-user-shield"></i>
                <span>Admin Panel</span>
                <small>Login → 2FA → JWT → Dashboard</small>
              </div>
            </div>

            <div class="auth-flow">
              <div class="auth-step"><i class="fas fa-sign-in-alt"></i><span>POST /auth/login</span></div>
              <div class="auth-arrow"><i class="fas fa-arrow-right"></i></div>
              <div class="auth-step"><i class="fas fa-mobile-alt"></i><span>2FA Email OTP</span></div>
              <div class="auth-arrow"><i class="fas fa-arrow-right"></i></div>
              <div class="auth-step"><i class="fas fa-id-badge"></i><span>JWT Issued</span></div>
              <div class="auth-arrow"><i class="fas fa-arrow-right"></i></div>
              <div class="auth-step node-auth-final"><i class="fas fa-tachometer-alt"></i><span>Admin Dashboard</span></div>
            </div>

          </div>
        </section>

        <!-- Features -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fas fa-star"></i> Key Features</h3>
          <ul class="sb-list">
            <li><i class="fas fa-check-circle"></i><span>Standalone Angular 17 components with lazy-loaded routes</span></li>
            <li><i class="fas fa-check-circle"></i><span>Reactive contact & hire-me forms with Joi server-side validation</span></li>
            <li><i class="fas fa-check-circle"></i><span>Admin panel with JWT + 2FA email OTP authentication</span></li>
            <li><i class="fas fa-check-circle"></i><span>Rate-limited public API (5 emails/hr per IP, skipped for admin)</span></li>
            <li><i class="fas fa-check-circle"></i><span>CV download endpoint with file streaming</span></li>
            <li><i class="fas fa-check-circle"></i><span>Analytics tracking (page views, contact events)</span></li>
            <li><i class="fas fa-check-circle"></i><span>HTML email templates for contact, hire, and 2FA notifications</span></li>
            <li><i class="fas fa-check-circle"></i><span>Dark / Light theme toggle with CSS custom properties</span></li>
            <li><i class="fas fa-check-circle"></i><span>Project modals, blog modals, full-screen preview overlays</span></li>
            <li><i class="fas fa-check-circle"></i><span>Animated background, typed effect, AOS scroll animations</span></li>
            <li><i class="fas fa-check-circle"></i><span>Winston logger + Morgan HTTP logging on backend</span></li>
            <li><i class="fas fa-check-circle"></i><span>Helmet security headers + CORS configuration</span></li>
          </ul>
        </section>

        <!-- Tech Stack -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fas fa-layer-group"></i> Tech Stack & Tools</h3>
          <div class="sb-stack-grid">
            <div class="sb-stack-group">
              <div class="sb-stack-label">Frontend</div>
              <div class="sb-tags">
                <span class="tag tag-frontend">Angular 17</span>
                <span class="tag tag-frontend">TypeScript</span>
                <span class="tag tag-frontend">RxJS</span>
                <span class="tag tag-frontend">SCSS</span>
                <span class="tag tag-frontend">SweetAlert2</span>
              </div>
            </div>
            <div class="sb-stack-group">
              <div class="sb-stack-label">Backend</div>
              <div class="sb-tags">
                <span class="tag tag-backend">Express.js</span>
                <span class="tag tag-backend">Node.js</span>
                <span class="tag tag-backend">Nodemailer</span>
                <span class="tag tag-backend">JWT</span>
                <span class="tag tag-backend">Joi</span>
              </div>
            </div>
            <div class="sb-stack-group">
              <div class="sb-stack-label">Security & Infra</div>
              <div class="sb-tags">
                <span class="tag tag-infra">Helmet</span>
                <span class="tag tag-infra">express-rate-limit</span>
                <span class="tag tag-infra">CORS</span>
                <span class="tag tag-infra">Winston</span>
                <span class="tag tag-infra">Morgan</span>
              </div>
            </div>
            <div class="sb-stack-group">
              <div class="sb-stack-label">Storage & Deploy</div>
              <div class="sb-tags">
                <span class="tag tag-deploy">JSON File DB</span>
                <span class="tag tag-deploy">Netlify</span>
                <span class="tag tag-deploy">GitHub Actions</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Methods Used -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fas fa-code"></i> Methods & Patterns Used</h3>
          <ul class="sb-list">
            <li><i class="fas fa-angle-right"></i><span>Standalone Components with lazy-loaded feature routes</span></li>
            <li><i class="fas fa-angle-right"></i><span>BehaviorSubject-driven UI state management (UiService)</span></li>
            <li><i class="fas fa-angle-right"></i><span>Smart/Dumb component pattern for modals and overlays</span></li>
            <li><i class="fas fa-angle-right"></i><span>Custom HTTP Interceptor for JWT token injection</span></li>
            <li><i class="fas fa-angle-right"></i><span>Reactive Forms with cross-field validation</span></li>
            <li><i class="fas fa-angle-right"></i><span>IntersectionObserver for scroll-spy and skill bar animations</span></li>
            <li><i class="fas fa-angle-right"></i><span>Express middleware chain: Helmet → CORS → Rate Limit → Validate → Controller</span></li>
            <li><i class="fas fa-angle-right"></i><span>MVC pattern on backend (routes → controllers → services)</span></li>
            <li><i class="fas fa-angle-right"></i><span>Environment-based config (dotenv) for dev/prod separation</span></li>
            <li><i class="fas fa-angle-right"></i><span>Centralized error handler middleware with Winston logging</span></li>
          </ul>
        </section>

        <!-- Backend API Routes -->
        <section class="sb-section">
          <h3 class="sb-section-title"><i class="fas fa-server"></i> Backend API Routes</h3>
          <div class="api-table">
            <div class="api-row api-header">
              <span>Method</span><span>Endpoint</span><span>Description</span>
            </div>
            <div class="api-row"><span class="method post">POST</span><span>/api/contact</span><span>Send contact email</span></div>
            <div class="api-row"><span class="method post">POST</span><span>/api/hire</span><span>Send hire request email</span></div>
            <div class="api-row"><span class="method get">GET</span><span>/api/cv/download</span><span>Stream CV PDF file</span></div>
            <div class="api-row"><span class="method post">POST</span><span>/api/auth/login</span><span>Admin login → 2FA OTP</span></div>
            <div class="api-row"><span class="method post">POST</span><span>/api/auth/verify-2fa</span><span>Verify OTP → JWT</span></div>
            <div class="api-row"><span class="method get">GET</span><span>/api/analytics</span><span>Get analytics data</span></div>
            <div class="api-row"><span class="method get">GET</span><span>/api/health</span><span>Health check</span></div>
          </div>
        </section>

      </div>
    </aside>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 3500;
      opacity: 0; visibility: hidden;
      transition: all 0.3s ease;
    }
    .sidebar-backdrop.active { opacity: 1; visibility: visible; }

    .portfolio-sidebar {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: 50vw;
      background: var(--bg-card);
      border-left: 1px solid var(--border-color);
      z-index: 3600;
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
      box-shadow: -8px 0 40px rgba(0,0,0,0.4);
    }
    .portfolio-sidebar.open { transform: translateX(0); }

    @media (max-width: 768px) {
      .portfolio-sidebar { width: 100vw; }
    }

    .sb-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary);
      flex-shrink: 0;
    }
    .sb-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px;
      background: var(--primary-100); color: var(--primary);
      border-radius: 999px; font-size: 0.75rem; font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .sb-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
    .sb-subtitle { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
    .sb-close {
      width: 36px; height: 36px; border-radius: 8px;
      background: var(--primary-100); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.2s ease;
    }
    .sb-close:hover { background: var(--primary); color: #fff; transform: rotate(90deg); }

    .sb-body {
      flex: 1; overflow-y: auto; padding: 1.5rem;
      display: flex; flex-direction: column; gap: 1.75rem;
    }
    .sb-body::-webkit-scrollbar { width: 5px; }
    .sb-body::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 999px; }

    .sb-section-title {
      font-size: 1rem; font-weight: 700; color: var(--text-primary);
      margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;
    }
    .sb-section-title i { color: var(--primary); }
    .sb-text { font-size: 0.9rem; line-height: 1.75; color: var(--text-secondary); }

    .sb-stats-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem; margin-top: 1rem;
    }
    @media (max-width: 480px) { .sb-stats-row { grid-template-columns: repeat(2,1fr); } }
    .sb-stat {
      background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: 10px; padding: 0.75rem 0.5rem; text-align: center;
    }
    .sb-stat-val { display: block; font-size: 0.875rem; font-weight: 700; color: var(--primary); }
    .sb-stat-lbl { display: block; font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }

    .flow-diagram {
      background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1.25rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    }
    .flow-row { display: flex; justify-content: center; width: 100%; }
    .flow-row-multi { gap: 0.5rem; flex-wrap: wrap; }
    .flow-node {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 0.6rem 0.9rem; border-radius: 10px;
      font-size: 0.78rem; font-weight: 600; text-align: center;
      border: 1px solid var(--border-color); min-width: 80px;
    }
    .flow-node i { font-size: 1.1rem; margin-bottom: 2px; }
    .flow-node small { font-size: 0.65rem; font-weight: 400; color: var(--text-muted); max-width: 120px; }
    .node-client { background: var(--primary-100); color: var(--primary); border-color: var(--primary); }
    .node-frontend { background: rgba(221,0,49,0.08); color: #dd0031; border-color: rgba(221,0,49,0.3); }
    .node-route { background: var(--primary-50); color: var(--primary); border-color: var(--border-color); flex: 1; min-width: 70px; max-width: 90px; }
    .node-middleware { background: rgba(245,158,11,0.08); color: #f59e0b; border-color: rgba(245,158,11,0.25); flex: 1; min-width: 70px; max-width: 90px; }
    .node-service { background: rgba(34,197,94,0.08); color: #22c55e; border-color: rgba(34,197,94,0.25); flex: 1; min-width: 90px; }
    .node-auth { background: rgba(139,92,246,0.1); color: #8b5cf6; border-color: rgba(139,92,246,0.3); width: 100%; max-width: 280px; }
    .flow-arrow-down { color: var(--text-muted); font-size: 0.8rem; }
    .flow-arrow-down.small { font-size: 0.65rem; }
    .flow-split-label { font-size: 0.65rem; color: var(--text-muted); font-style: italic; }
    .flow-split-row { display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; }
    .flow-split-line { width: 80%; height: 1px; background: var(--border-color); }
    .flow-split-arrows { display: flex; gap: 1.5rem; }

    .auth-flow {
      display: flex; align-items: center; flex-wrap: wrap;
      gap: 0.25rem; justify-content: center;
      background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.2);
      border-radius: 10px; padding: 0.75rem; width: 100%;
    }
    .auth-step {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      font-size: 0.68rem; font-weight: 600; color: #8b5cf6; text-align: center;
      padding: 0.4rem 0.5rem; background: rgba(139,92,246,0.1); border-radius: 8px;
    }
    .auth-step i { font-size: 0.9rem; }
    .auth-arrow { color: var(--text-muted); font-size: 0.7rem; }
    .node-auth-final { background: rgba(139,92,246,0.2) !important; }

    .sb-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .sb-list li { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }
    .sb-list li i { color: var(--primary); margin-top: 3px; flex-shrink: 0; font-size: 0.8rem; }

    .sb-stack-grid { display: flex; flex-direction: column; gap: 1rem; }
    .sb-stack-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; }
    .sb-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }
    .tag-frontend { background: rgba(221,0,49,0.1); color: #dd0031; }
    .tag-backend { background: var(--primary-100); color: var(--primary); }
    .tag-infra { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .tag-deploy { background: rgba(34,197,94,0.1); color: #22c55e; }

    .api-table { display: flex; flex-direction: column; border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; }
    .api-row { display: grid; grid-template-columns: 60px 1fr 1fr; gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.78rem; border-bottom: 1px solid var(--border-light); align-items: center; }
    .api-row:last-child { border-bottom: none; }
    .api-header { background: var(--bg-tertiary); font-weight: 700; color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; }
    .api-row span:nth-child(2) { font-family: monospace; color: var(--text-primary); font-size: 0.78rem; }
    .api-row span:nth-child(3) { color: var(--text-secondary); }
    .method { padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.7rem; text-align: center; }
    .method.post { background: var(--primary-100); color: var(--primary); }
    .method.get { background: rgba(34,197,94,0.15); color: #22c55e; }
  `]
})
export class PortfolioProjectSidebarComponent {
  constructor(public uiService: UiService) {}
}
