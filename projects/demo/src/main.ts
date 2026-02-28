import { provideZoneChangeDetection } from "@angular/core";
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { rootRoutes } from './app/root.routes';

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection(),provideRouter(rootRoutes), provideHttpClient()],
}).catch(console.error);
