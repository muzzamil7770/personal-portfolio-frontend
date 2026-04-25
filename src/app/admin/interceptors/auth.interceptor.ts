import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CooldownService } from '../../core/services/cooldown.service';
import { CookieService } from '../../core/services/cookie.service';

// Only these admin-managed routes should trigger the cooldown overlay on 429
const RATE_LIMITED_PATHS = ['/api/contact', '/api/hire'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('admin_token');
  const cooldownService = inject(CooldownService);

  if (token && req.url.includes('/api/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        const isRateLimitedRoute = RATE_LIMITED_PATHS.some(p => req.url.includes(p));
        if (isRateLimitedRoute) {
          const retryAfter = error.headers.get('retry-after');
          const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 120000;
          cooldownService.activate(delayMs, error.error?.message || 'Too many requests. Please wait.');
        }
      }
      return throwError(() => error);
    })
  );
};
