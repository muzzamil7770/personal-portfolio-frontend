import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CooldownService } from '../../core/services/cooldown.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('admin_token');
  const cooldownService = inject(CooldownService);

  if (token && req.url.includes('/api/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        // Activate cooldown overlay
        const retryAfter = error.headers.get('retry-after');
        const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 120000;
        cooldownService.activate(delayMs, error.error?.message || 'Too many requests. Please wait.');
      }
      return throwError(() => error);
    })
  );
};
