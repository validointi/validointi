import { CommonModule } from '@angular/common';
import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

const APP_ROUTES = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./app/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./app/about.component').then((c) => c.AboutComponent),
  },
] as Routes;

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(RouterModule.forRoot(APP_ROUTES))],
}).catch(console.error);
