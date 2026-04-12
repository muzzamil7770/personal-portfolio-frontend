import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AppTheme {
  id: string;
  label: string;
  icon: string;         // FA class
  bodyClass: string;   // applied to <body>
}

export const THEMES: AppTheme[] = [
  { id: 'dark',       label: 'Dark',        icon: 'fas fa-moon',          bodyClass: '' },
  { id: 'light',      label: 'Light',       icon: 'fas fa-sun',           bodyClass: 'light' },
  { id: 'ocean',      label: 'Ocean',       icon: 'fas fa-water',         bodyClass: 'theme-ocean' },
  { id: 'forest',     label: 'Forest',      icon: 'fas fa-leaf',          bodyClass: 'theme-forest' },
  { id: 'rose',       label: 'Rose',        icon: 'fas fa-heart',         bodyClass: 'theme-rose' },
  { id: 'midnight',   label: 'Midnight',    icon: 'fas fa-star',          bodyClass: 'theme-midnight' },
  { id: 'amber',      label: 'Amber',       icon: 'fas fa-fire',          bodyClass: 'theme-amber' },
];

const THEME_KEY = 'app_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isBrowser: boolean;
  private _current = new BehaviorSubject<string>('dark');
  current$ = this._current.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  initTheme(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    this.applyTheme(saved);
  }

  setTheme(id: string): void {
    if (!this.isBrowser) return;
    this.applyTheme(id);
    localStorage.setItem(THEME_KEY, id);
  }

  toggleTheme(): void {
    const cur = this._current.value;
    this.setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme(): string {
    return this._current.value;
  }

  // Legacy compat
  setThemeLegacy(theme: 'light' | 'dark'): void { this.setTheme(theme); }

  private applyTheme(id: string): void {
    const theme = THEMES.find(t => t.id === id) ?? THEMES[0];
    // Remove all theme body classes
    THEMES.forEach(t => { if (t.bodyClass) document.body.classList.remove(t.bodyClass); });
    if (theme.bodyClass) document.body.classList.add(theme.bodyClass);
    this._current.next(theme.id);
    this.updateIcons(theme.id);
  }

  private updateIcons(id: string): void {
    const icon = id === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    document.querySelectorAll('.theme-toggle-circle i').forEach(el => { el.className = icon; });
  }
}
