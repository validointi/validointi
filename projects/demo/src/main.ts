import { importProvidersFrom, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/AppComponent';
import { rootRoutes } from './app/root.routes';

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(RouterModule.forRoot(rootRoutes))],
}).catch(console.error);
