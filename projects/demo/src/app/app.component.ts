import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header>
      <nav>
        <ol>
          <li><a routerLink="home">Home</a></li>
          <li><a routerLink="about">About</a></li>
          <li><a routerLink="form1">Form1</a></li>
        </ol>
      </nav>
    </header>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      header nav {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      header nav ol {
        padding-inline-start: unset;
      }
      header nav ol li {
        display: inline-block;
        margin-left: var(--size-5);
      }
    `,
  ],
})
export class AppComponent {}
