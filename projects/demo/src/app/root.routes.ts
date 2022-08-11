import { Routes } from '@angular/router';

export const rootRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('./home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./about.component').then((c) => c.AboutComponent),
  },
  { path: 'form1',
  loadComponent: () => import('./form1/form1.component').then((c) => c.Form1Component) },
];
