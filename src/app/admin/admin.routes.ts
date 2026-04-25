import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'contacts', pathMatch: 'full' },
      {
        path: 'contacts',
        loadComponent: () => import('./contacts/contacts.component').then(m => m.ContactsComponent)
      },
      {
        path: 'hires',
        loadComponent: () => import('./hires/hires.component').then(m => m.HiresComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'ai-stats',
        loadComponent: () => import('./ai-stats/ai-stats.component').then(m => m.AiStatsComponent)
      },
      {
        path: 'conversations',
        loadComponent: () => import('./conversations/conversations.component').then(m => m.ConversationsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./calendar/calendar.component').then(m => m.AdminCalendarComponent)
      },
      {
        path: 'video-call',
        loadComponent: () => import('./video-call/meeting-management.component').then(m => m.MeetingManagementComponent)
      },
      {
        path: 'video-call/:room',
        loadComponent: () => import('./video-call/video-call.component').then(m => m.VideoCallComponent)
      }
    ]
  }
];
