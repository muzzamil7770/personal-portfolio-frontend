import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface Hire {
  id: string;
  name: string;
  email: string;
  budget: string;
  message: string;
  services: string;
  status: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message: string;
  requires2FA?: boolean;
}

export interface Verify2FAResponse {
  success: boolean;
  token?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Auth
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { username, password });
  }

  verify2FA(code: string): Observable<Verify2FAResponse> {
    return this.http.post<Verify2FAResponse>(`${this.base}/auth/verify-2fa`, { code });
  }

  resend2FA(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.base}/auth/resend-2fa`, {});
  }

  // Contacts
  getContacts(): Observable<{ success: boolean; data: Contact[] }> {
    return this.http.get<any>(`${this.base}/contact`);
  }
  getContactById(id: string): Observable<{ success: boolean; data: Contact }> {
    return this.http.get<any>(`${this.base}/contact/${id}`);
  }
  updateContact(id: string, body: Partial<Contact>): Observable<any> {
    return this.http.put(`${this.base}/contact/${id}`, body);
  }
  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.base}/contact/${id}`);
  }

  // Hires
  getHires(): Observable<{ success: boolean; data: Hire[] }> {
    return this.http.get<any>(`${this.base}/hire`);
  }
  getHireById(id: string): Observable<{ success: boolean; data: Hire }> {
    return this.http.get<any>(`${this.base}/hire/${id}`);
  }
  updateHire(id: string, body: Partial<Hire>): Observable<any> {
    return this.http.put(`${this.base}/hire/${id}`, body);
  }
  deleteHire(id: string): Observable<any> {
    return this.http.delete(`${this.base}/hire/${id}`);
  }

  // Analytics
  getAnalyticsStats(): Observable<{ success: boolean; data: any }> {
    return this.http.get<any>(`${this.base}/analytics/stats`);
  }
  getLiveCount(): Observable<{ success: boolean; watching: number }> {
    return this.http.get<any>(`${this.base}/analytics/live`);
  }
  trackVisit(body: { sessionId: string; page: string; referrer: string; userAgent: string }): Observable<any> {
    return this.http.post(`${this.base}/analytics/track`, body);
  }
}
