import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UiService } from '../../../core/services/ui.service';
import { DataService, SiteData } from '../../../core/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div class="mm-backdrop" [class.visible]="isOpen" (click)="close()"></div>

    <!-- Sidebar Panel -->
    <div class="mm-panel" [class.open]="isOpen">

      <!-- Header -->
      <div class="mm-header">
        <div class="mm-profile">
          <img class="mm-avatar" src="assets/MUZZAMIL.png" alt="Muhammad Muzzamil" />
          <div class="mm-profile-info">
            <span class="mm-name">Muhammad Muzzamil</span>
            <span class="mm-role">Full Stack Developer</span>
          </div>
        </div>
        <button class="mm-close" (click)="close()" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="mm-nav">
        <div class="mm-nav-label">Navigation</div>
        @for (link of siteData.nav.links; track link.href; let i = $index) {
          <a
            [href]="link.href"
            class="mm-link"
            [class.visible]="isOpen"
            [style.transition-delay]="isOpen ? (i * 45 + 80) + 'ms' : '0ms'"
            (click)="close()">
            <span class="mm-link-icon" [innerHTML]="icons[i]"></span>
            <span class="mm-link-label">{{ link.label }}</span>
            <span class="mm-link-arrow">›</span>
          </a>
        }
      </nav>

      <!-- Hire Me CTA -->
      <div class="mm-cta-wrap" [class.visible]="isOpen" [style.transition-delay]="isOpen ? '520ms' : '0ms'">
        <button class="mm-hire-btn" (click)="hire()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5"/></svg>
          <span>Hire Me</span>
          <span class="mm-hire-badge">Available</span>
        </button>
      </div>

      <!-- Social Links -->
      <div class="mm-socials" [class.visible]="isOpen" [style.transition-delay]="isOpen ? '580ms' : '0ms'">
        <a href="https://github.com/muzzamil7770" target="_blank" class="mm-social" aria-label="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
        </a>
        <a href="https://linkedin.com/in/muzzamil7770" target="_blank" class="mm-social" aria-label="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="https://wa.me/923001234567" target="_blank" class="mm-social" aria-label="WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="https://upwork.com/freelancers/muzzamil" target="_blank" class="mm-social" aria-label="Upwork">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/></svg>
        </a>
      </div>

      <!-- Footer -->
      <div class="mm-footer" [class.visible]="isOpen" [style.transition-delay]="isOpen ? '620ms' : '0ms'">
        <span>Available for freelance work</span>
        <span class="mm-status-dot"></span>
      </div>

    </div>
  `,
  styles: [`
    .mm-backdrop {
      position: fixed; inset: 0; z-index: 1199;
      background: rgba(0,0,0,0); backdrop-filter: blur(0px);
      pointer-events: none;
      transition: background 0.35s ease, backdrop-filter 0.35s ease;
    }
    .mm-backdrop.visible {
      background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
      pointer-events: all;
    }

    .mm-panel {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: 1200;
      width: 300px; max-width: 85vw;
      background: var(--bg-card);
      border-left: 1px solid var(--border-color);
      display: flex; flex-direction: column;
      transform: translateX(100%);
      opacity: 0;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
      box-shadow: -12px 0 50px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .mm-panel.open {
      transform: translateX(0); opacity: 1;
    }

    /* Header */
    .mm-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1rem 1rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .mm-profile { display: flex; align-items: center; gap: 0.75rem; }
    .mm-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      object-fit: cover; object-position: top;
      flex-shrink: 0; box-shadow: 0 0 0 3px var(--primary-100);
    }
    .mm-profile-info { display: flex; flex-direction: column; gap: 2px; }
    .mm-name { color: var(--text-primary); font-size: 0.88rem; font-weight: 700; line-height: 1; }
    .mm-role { color: var(--primary); font-size: 0.7rem; font-weight: 500; }
    .mm-close {
      width: 34px; height: 34px; border-radius: 8px; border: none;
      background: var(--bg-tertiary); color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s, color 0.2s; flex-shrink: 0;
    }
    .mm-close:hover { background: #ef4444; color: #fff; }

    /* Nav */
    .mm-nav { display: flex; flex-direction: column; padding: 1rem 0.75rem 0.5rem; flex: 1; overflow-y: auto; }
    .mm-nav-label {
      color: var(--text-muted); font-size: 0.65rem; font-weight: 700;
      letter-spacing: 1.2px; text-transform: uppercase;
      padding: 0 0.25rem; margin-bottom: 0.5rem;
    }
    .mm-link {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 0.85rem; border-radius: 10px;
      color: var(--text-secondary); text-decoration: none;
      font-size: 0.9rem; font-weight: 500;
      transition: background 0.2s, color 0.2s, transform 0.2s,
                  opacity 0.35s ease, translate 0.35s ease;
      opacity: 0; translate: 20px 0;
      margin-bottom: 2px;
    }
    .mm-link.visible { opacity: 1; translate: 0 0; }
    .mm-link:hover {
      background: var(--primary-100); color: var(--primary);
      transform: translateX(4px);
    }
    .mm-link-icon {
      width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
      background: var(--bg-tertiary); border: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .mm-link:hover .mm-link-icon {
      background: var(--primary-100); color: var(--primary); border-color: var(--primary);
    }
    .mm-link-label { flex: 1; }
    .mm-link-arrow {
      color: var(--text-muted); font-size: 1.1rem;
      transition: transform 0.2s, color 0.2s;
    }
    .mm-link:hover .mm-link-arrow { transform: translateX(3px); color: var(--primary); }

    /* CTA */
    .mm-cta-wrap {
      padding: 0 0.75rem 0.75rem;
      opacity: 0; translate: 0 10px;
      transition: opacity 0.35s ease, translate 0.35s ease;
    }
    .mm-cta-wrap.visible { opacity: 1; translate: 0 0; }
    .mm-hire-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      padding: 0.85rem 1rem; border-radius: 12px; border: none;
      background: linear-gradient(135deg, var(--primary), #818cf8);
      color: #fff; font-size: 0.92rem; font-weight: 700;
      cursor: pointer; transition: opacity 0.2s, transform 0.2s;
      box-shadow: 0 4px 20px rgba(99,102,241,0.4);
    }
    .mm-hire-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .mm-hire-badge {
      background: rgba(255,255,255,0.2); border-radius: 20px;
      padding: 2px 8px; font-size: 0.65rem; font-weight: 600;
    }

    /* Socials */
    .mm-socials {
      display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border-color);
      opacity: 0; translate: 0 10px;
      transition: opacity 0.35s ease, translate 0.35s ease;
    }
    .mm-socials.visible { opacity: 1; translate: 0 0; }
    .mm-social {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      color: var(--text-muted); display: flex; align-items: center; justify-content: center;
      text-decoration: none; transition: background 0.2s, color 0.2s, transform 0.2s;
    }
    .mm-social:hover { background: var(--primary); color: #fff; transform: translateY(-2px); border-color: var(--primary); }

    /* Footer */
    .mm-footer {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 0.65rem 1rem;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      color: var(--text-muted); font-size: 0.72rem;
      opacity: 0; translate: 0 10px;
      transition: opacity 0.35s ease, translate 0.35s ease;
    }
    .mm-footer.visible { opacity: 1; translate: 0 0; }
    .mm-status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
      box-shadow: 0 0 0 0 rgba(34,197,94,.6); animation: mm-pulse 2s infinite;
    }
    @keyframes mm-pulse {
      0% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
      70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
  `]
})
export class MobileMenuComponent implements OnInit, OnDestroy {
  siteData: SiteData;
  isOpen = false;
  icons: SafeHtml[] = [];
  private sub?: Subscription;

  private readonly rawIcons = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5v-4h3v4H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354z"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm6 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2M2 5h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/><path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/></svg>`,
  ];

  constructor(
    public uiService: UiService,
    private dataService: DataService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.siteData = this.dataService.getData();
    this.icons = this.rawIcons.map(svg => this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  ngOnInit() {
    this.sub = this.uiService.mobileMenuOpen$.subscribe(open => {
      this.isOpen = open;
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  close() { this.uiService.closeMobileMenu(); }

  hire() {
    this.uiService.closeMobileMenu();
    this.uiService.openHireMeModal();
  }
}
