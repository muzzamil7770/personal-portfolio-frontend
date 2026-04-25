import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from './cookie.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  icon: string;
  isRead: boolean;
  type?: string;
  status?: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSource = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSource.asObservable();

  constructor(private cookieService: CookieService) {
    this.loadFromCookies();
  }

  private loadFromCookies() {
    const saved = this.cookieService.getObject('_notifications');
    if (saved && Array.isArray(saved)) {
      // Convert string dates back to Date objects and deduplicate by message
      const seen = new Set();
      const parsed = saved
        .map(n => ({ ...n, time: new Date(n.time) }))
        .filter(n => {
          if (seen.has(n.message)) return false;
          seen.add(n.message);
          return true;
        });
      
      this.notificationsSource.next(parsed);
      // Save clean version back to cookies
      if (parsed.length !== saved.length) {
        this.saveToCookies(parsed);
      }
    }
  }

  addNotification(title: string, message: string, icon: string, type = 'info', status: Notification['status'] = 'info') {
    const current = this.notificationsSource.value;
    
    // Global duplicate check: don't add if exactly same message exists
    if (current.some(n => n.message === message)) return;

    const noti: Notification = {
      id: Date.now(),
      title,
      message,
      icon,
      time: new Date(),
      isRead: false,
      type,
      status
    };

    const updated = [noti, ...current].slice(0, 30);
    this.notificationsSource.next(updated);
    this.saveToCookies(updated);
  }

  setNotifications(notis: Notification[]) {
    this.notificationsSource.next(notis);
    this.saveToCookies(notis);
  }

  markAllAsRead() {
    const updated = this.notificationsSource.value.map(n => ({ ...n, isRead: true }));
    this.notificationsSource.next(updated);
    this.saveToCookies(updated);
  }

  private saveToCookies(notis: Notification[]) {
    this.cookieService.setObject('_notifications', notis, 7);
  }
}
