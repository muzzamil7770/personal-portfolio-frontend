import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../services/admin-api.service';
import { ThemeService } from '../../core/services/theme.service';
import { CooldownService } from '../../core/services/cooldown.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrap">

      <!-- Top bar: theme toggle + back to portfolio -->
      <div class="login-topbar">
        <a class="back-btn" routerLink="/" title="Back to Portfolio">
          <i class="fas fa-arrow-left"></i>
          <span>Back to Portfolio</span>
        </a>
        <div class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle theme" role="button">
          <div class="theme-toggle-circle"><i class="fas fa-moon"></i></div>
        </div>
      </div>

      <div class="login-card">
        <div class="login-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <h2>Admin Portal</h2>
        <p class="subtitle">Portfolio Management System</p>

        <form (ngSubmit)="login()">
          <div class="field">
            <label>Username</label>
            <div class="input-wrap">
              <i class="fas fa-user input-icon"></i>
              <input type="text" [(ngModel)]="username" name="username" placeholder="Enter username" required autocomplete="username" />
            </div>
          </div>
          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <i class="fas fa-lock input-icon"></i>
              <input [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
              <button type="button" class="pass-toggle" (click)="showPass = !showPass" tabindex="-1">
                <i [class]="showPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          <p class="error" *ngIf="error"><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
          <button type="submit" class="submit-btn" [disabled]="loading">
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            <i class="fas fa-sign-in-alt" *ngIf="!loading"></i>
            {{ loading ? 'Verifying...' : 'Login' }}
          </button>
        </form>

        <div class="login-divider"><span>or</span></div>
        <a class="portfolio-link" routerLink="/">
          <i class="fas fa-globe"></i>
          View Portfolio
        </a>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh; display: flex; flex-direction: column; align-items: center;
      justify-content: center; background: var(--bg-primary); padding: 1rem;
      position: relative;
    }
    .login-topbar {
      position: fixed; top: 0; left: 0; right: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.875rem 1.5rem;
      background: var(--bg-nav); border-bottom: 1px solid var(--border-light);
      backdrop-filter: blur(12px); z-index: 100;
    }
    .back-btn {
      display: flex; align-items: center; gap: 8px;
      color: var(--text-secondary); text-decoration: none; font-size: 0.875rem; font-weight: 500;
      padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color);
      transition: all 0.2s;
    }
    .back-btn:hover { color: var(--primary); border-color: var(--primary); background: var(--primary-100); }
    .theme-toggle {
      width: 44px; height: 24px; background: var(--primary);
      border-radius: 999px; position: relative; cursor: pointer; flex-shrink: 0;
    }
    .theme-toggle-circle {
      position: absolute; top: 2px; left: 2px;
      width: 20px; height: 20px; background: #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: var(--primary); transition: transform 0.25s ease;
    }
    body.light .theme-toggle-circle { transform: translateX(20px); }
    .login-card {
      background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px;
      padding: 2.5rem 2rem; width: 100%; max-width: 400px; text-align: center;
      box-shadow: var(--shadow-xl); margin-top: 72px;
    }
    .login-icon {
      width: 64px; height: 64px; border-radius: 16px;
      background: var(--primary-100); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; margin: 0 auto 1rem;
    }
    h2 { color: var(--text-primary); margin: 0 0 4px; font-size: 1.5rem; font-weight: 700; }
    .subtitle { color: var(--text-muted); margin: 0 0 2rem; font-size: 0.875rem; }
    .field { margin-bottom: 1.25rem; text-align: left; }
    label { display: block; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 6px; font-weight: 600; }
    .input-wrap { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 12px; color: var(--text-muted); font-size: 0.875rem; pointer-events: none; }
    input {
      width: 100%; padding: 0.7rem 0.9rem 0.7rem 2.5rem; border-radius: 10px;
      border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary);
      font-size: 0.95rem; box-sizing: border-box; outline: none; font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-100); }
    input::placeholder { color: var(--text-muted); }
    .pass-toggle {
      position: absolute; right: 10px; background: none; border: none;
      color: var(--text-muted); cursor: pointer; padding: 4px; font-size: 0.875rem;
      transition: color 0.2s;
    }
    .pass-toggle:hover { color: var(--primary); }
    .submit-btn {
      width: 100%; padding: 0.8rem; background: var(--primary); color: #fff;
      border: none; border-radius: 10px; font-size: 1rem; font-weight: 600;
      cursor: pointer; margin-top: 0.5rem; display: flex; align-items: center;
      justify-content: center; gap: 8px; transition: opacity 0.2s, transform 0.2s;
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error {
      color: #f87171; font-size: 0.85rem; margin: -0.5rem 0 0.75rem; text-align: left;
      display: flex; align-items: center; gap: 6px;
      background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
      padding: 8px 12px; border-radius: 8px;
    }
    .login-divider {
      display: flex; align-items: center; gap: 12px;
      margin: 1.5rem 0 1rem; color: var(--text-muted); font-size: 0.8rem;
    }
    .login-divider::before, .login-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border-color);
    }
    .portfolio-link {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 0.7rem; border-radius: 10px;
      border: 1px solid var(--border-color); color: var(--text-secondary);
      text-decoration: none; font-size: 0.9rem; font-weight: 500;
      transition: all 0.2s;
    }
    .portfolio-link:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-100); }
    .portfolio-link i { color: var(--primary); }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPass = false;
  error = '';
  loading = false;

  constructor(private api: AdminApiService, private router: Router, public themeService: ThemeService, private cooldown: CooldownService) {}

  ngOnInit(): void {
    // Redirect to dashboard if already authenticated
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
          return;
        }
        // Token expired, clean up
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_token');
      } catch {
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_token');
      }
    }
  }

  async login() {
    this.error = '';
    
    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password.';
      return;
    }

    this.loading = true;
    
    try {
      const response = await this.api.login(this.username, this.password).toPromise();
      
      if (response?.success && response.requires2FA) {
        // Show 2FA verification modal
        await this.show2FAVerification();
      } else if (response?.success && response.token) {
        // Direct login (fallback if 2FA is disabled)
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_token', response.token);
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error = response?.message || 'Login failed.';
      }
    } catch (err: any) {
      const status = err?.status ?? err?.error?.status;
      if (status === 429) {
        const retryAfter = err?.headers?.get('retry-after');
        const ms = retryAfter ? parseInt(retryAfter, 10) * 1000 : 900000;
        this.cooldown.activate(ms, err?.error?.message || 'Too many login attempts. Please wait before trying again.');
      } else {
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async show2FAVerification() {
    const { value: code } = await Swal.fire({
      title: 'Two-Factor Authentication',
      html: `
        <div class="tfa-container">
          <div class="tfa-icon-lock">🔐</div>
          <p class="tfa-description">
            A 6-digit verification code has been sent to your email.
            Enter it below to complete your login.
          </p>
          <input
            id="swal-2fa-code"
            type="text"
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
            class="swal2-input tfa-input"
            placeholder="000000"
            autofocus
          />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Verify & Login',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#475569',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const input = document.getElementById('swal-2fa-code') as HTMLInputElement;
        const code = input?.value;

        if (!code || code.length !== 6) {
          Swal.showValidationMessage('Please enter all 6 digits');
          return false;
        }

        if (!/^\d+$/.test(code)) {
          Swal.showValidationMessage('Only numeric digits allowed');
          return false;
        }

        return code;
      },
      allowOutsideClick: false,
      allowEscapeKey: true,
      customClass: {
        popup: 'tfa-popup',
        title: 'tfa-title',
        confirmButton: 'tfa-confirm-btn',
        cancelButton: 'tfa-cancel-btn',
        validationMessage: 'tfa-validation-msg'
      }
    });

    if (code) {
      await this.verify2FACode(code);
    }
  }

  async verify2FACode(code: string) {
    try {
      const response = await this.api.verify2FA(code).toPromise();
      
      if (response?.success && response.token) {
        // Login successful
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_token', response.token);
        
        await Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: response.message || 'Login successful!',
          confirmButtonColor: '#6366f1',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: 'tfa-popup',
            title: 'tfa-title'
          }
        });
        
        this.router.navigate(['/admin/dashboard']);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: response?.message || 'Invalid verification code. Please try again.',
          confirmButtonColor: '#6366f1',
          showCancelButton: true,
          confirmButtonText: 'Try Again',
          cancelButtonText: 'Resend Code',
          customClass: {
            popup: 'tfa-popup',
            title: 'tfa-title',
            confirmButton: 'tfa-confirm-btn',
            cancelButton: 'tfa-cancel-btn'
          }
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            this.resend2FACode();
          } else {
            this.show2FAVerification();
          }
        });
      }
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err.error?.message || 'Invalid code. Please try again.',
        confirmButtonColor: '#6366f1',
        showCancelButton: true,
        confirmButtonText: 'Try Again',
        cancelButtonText: 'Resend Code',
        customClass: {
          popup: 'tfa-popup',
          title: 'tfa-title',
          confirmButton: 'tfa-confirm-btn',
          cancelButton: 'tfa-cancel-btn'
        }
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          this.resend2FACode();
        } else {
          this.show2FAVerification();
        }
      });
    }
  }

  async resend2FACode() {
    try {
      const response = await this.api.resend2FA().toPromise();
      
      await Swal.fire({
        icon: 'success',
        title: 'Code Sent!',
        text: response?.message || 'A new verification code has been sent to your email.',
        confirmButtonColor: '#6366f1',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'tfa-popup',
          title: 'tfa-title'
        }
      });
      
      // Show 2FA verification again
      await this.show2FAVerification();
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Resend',
        text: err.error?.message || 'Failed to resend code. Please wait a moment and try again.',
        confirmButtonColor: '#6366f1',
        customClass: {
          popup: 'tfa-popup',
          title: 'tfa-title',
          confirmButton: 'tfa-confirm-btn'
        }
      });
    }
  }
}
