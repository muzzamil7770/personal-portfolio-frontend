import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({ providedIn: 'root' })
export class VisitorTrackingService {
  private sessionId = '';
  private heartbeatSub?: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.sessionId = this.getOrCreateSession();
    this.track();
    this.sessionId = this.getOrCreateSession();
    this.track();
  }

  private getOrCreateSession(): string {
    let id = this.cookieService.get('_vsid');
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      this.cookieService.set('_vsid', id, 7);
    }
    return id;
  }

  private parseBrowser(ua: string): { browser: string; browserVersion: string } {
    const tests: [RegExp, string][] = [
      [/Edg\/([0-9.]+)/, 'Edge'],
      [/OPR\/([0-9.]+)/, 'Opera'],
      [/Chrome\/([0-9.]+)/, 'Chrome'],
      [/Firefox\/([0-9.]+)/, 'Firefox'],
      [/Safari\/([0-9.]+)/, 'Safari'],
      [/MSIE ([0-9.]+)/, 'IE'],
      [/Trident.*rv:([0-9.]+)/, 'IE'],
    ];
    for (const [re, name] of tests) {
      const m = ua.match(re);
      if (m) return { browser: name, browserVersion: m[1].split('.')[0] };
    }
    return { browser: 'Unknown', browserVersion: '' };
  }

  private parseOS(ua: string): { os: string; osVersion: string } {
    if (/Windows NT 10/.test(ua)) return { os: 'Windows', osVersion: '10/11' };
    if (/Windows NT 6.3/.test(ua)) return { os: 'Windows', osVersion: '8.1' };
    if (/Windows NT 6.1/.test(ua)) return { os: 'Windows', osVersion: '7' };
    if (/Windows/.test(ua)) return { os: 'Windows', osVersion: '' };
    const macM = ua.match(/Mac OS X ([0-9_]+)/);
    if (macM) return { os: 'macOS', osVersion: macM[1].replace(/_/g, '.') };
    const iosM = ua.match(/iPhone OS ([0-9_]+)/);
    if (iosM) return { os: 'iOS', osVersion: iosM[1].replace(/_/g, '.') };
    if (/iPad/.test(ua)) return { os: 'iPadOS', osVersion: '' };
    const andM = ua.match(/Android ([0-9.]+)/);
    if (andM) return { os: 'Android', osVersion: andM[1] };
    if (/Linux/.test(ua)) return { os: 'Linux', osVersion: '' };
    return { os: 'Unknown', osVersion: '' };
  }

  private getDevice(ua: string): string {
    if (/Mobi|Android|iPhone|iPod/.test(ua)) return 'mobile';
    if (/iPad|Tablet/.test(ua)) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string {
    const nav = navigator as any;
    return nav.connection?.effectiveType || nav.connection?.type || '';
  }

  private track(): void {
    const ua = navigator.userAgent;
    const { browser, browserVersion } = this.parseBrowser(ua);
    const { os, osVersion } = this.parseOS(ua);

    const payload = {
      sessionId: this.sessionId,
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: ua,
      browser,
      browserVersion,
      os,
      osVersion,
      device: this.getDevice(ua),
      screenWidth: screen.width,
      screenHeight: screen.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: screen.colorDepth,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unspecified',
      connectionType: this.getConnectionType(),
    };

    this.http.post(`${environment.apiUrl}/analytics/track`, payload).subscribe();
  }

  destroy(): void {
  }
}
