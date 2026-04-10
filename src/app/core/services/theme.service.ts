import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'theme';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Initialize theme from localStorage or default to dark
   */
  initTheme(): void {
    if (!this.isBrowser) return;
    
    const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
    this.setTheme(savedTheme as 'light' | 'dark');
  }

  /**
   * Set theme and update document body
   */
  setTheme(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) return;
    
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    
    localStorage.setItem(this.themeKey, theme);
    this.updateThemeIcons(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    if (!this.isBrowser) return;
    
    const currentTheme = document.body.classList.contains('light') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): 'light' | 'dark' {
    if (!this.isBrowser) return 'dark';
    
    return document.body.classList.contains('light') ? 'light' : 'dark';
  }

  /**
   * Update theme toggle icons
   */
  private updateThemeIcons(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) return;
    
    const icons = document.querySelectorAll('.theme-toggle-circle i');
    icons.forEach(icon => {
      icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }
}
