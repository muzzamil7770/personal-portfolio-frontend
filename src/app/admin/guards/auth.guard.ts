import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('admin_token');

  if (!token) {
    router.navigate(['/admin'], { replaceUrl: true });
    return false;
  }

  // Decode payload and check expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_token');
      router.navigate(['/admin'], { replaceUrl: true });
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_token');
    router.navigate(['/admin'], { replaceUrl: true });
    return false;
  }
};
