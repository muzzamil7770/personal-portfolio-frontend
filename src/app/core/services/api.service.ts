import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CooldownService } from './cooldown.service';
import { ToastService } from './toast.service';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface HireFormData {
  name: string;
  email: string;
  budget?: string;
  message: string;
  services?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cooldown: CooldownService, private toast: ToastService) {}

  submitContactForm(data: ContactFormData): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/contact`, data)
      .pipe(catchError(err => this.handleError(err)));
  }

  submitHireForm(data: HireFormData): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/hire`, data)
      .pipe(catchError(err => this.handleError(err)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 429) {
      // Daily IP limit exceeded
      if (error.error?.limitExceeded) {
        const msg = error.error.message || 'You have reached the daily submission limit. Please try again tomorrow.';
        this.toast.error('Daily Limit Reached 🚫', msg);
        return throwError(() => new Error(msg));
      }
      // General rate limit (cooldown overlay)
      const retryAfter = error.headers?.get('retry-after');
      const ms = retryAfter ? parseInt(retryAfter, 10) * 1000 : 3600000;
      const reason = error.error?.message || 'Too many requests. Please wait before trying again.';
      this.cooldown.activate(ms, reason);
      return throwError(() => new Error(reason));
    }

    let message = 'An unexpected error occurred. Please try again.';
    if (error.status === 0) {
      message = 'Unable to reach the server. Please check your connection.';
    } else if (error.status === 422 && error.error?.errors?.length) {
      message = error.error.errors.join(' ');
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
    }

    return throwError(() => new Error(message));
  }
}
