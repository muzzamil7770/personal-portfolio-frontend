import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'scroll-3d-demo',
    loadComponent: () =>
      import('./features/scroll-3d-demo/scroll-3d-demo.component')
        .then(m => m.Scroll3dDemoComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  { path: '**', redirectTo: '' }
];
