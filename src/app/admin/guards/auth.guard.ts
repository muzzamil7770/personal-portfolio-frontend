import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from '../../core/services/cookie.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const token = cookieService.get('admin_token');

  if (!token) {
    router.navigate(['/admin'], { replaceUrl: true });
    return false;
  }

  // Decode payload and check expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      cookieService.delete('admin_auth');
      cookieService.delete('admin_token');
      router.navigate(['/admin'], { replaceUrl: true });
      return false;
    }
    return true;
  } catch {
    cookieService.delete('admin_auth');
    cookieService.delete('admin_token');
    router.navigate(['/admin'], { replaceUrl: true });
    return false;
  }
};
