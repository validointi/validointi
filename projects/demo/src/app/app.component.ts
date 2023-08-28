import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header>
      <nav>
        <a routerLink="home">Home</a>
        <a routerLink="about">About</a>
        <a routerLink="form1">Form1</a>
        <a routerLink="form2">Form2</a>
        <a routerLink="form3">Form3</a>
        <a routerLink="joi">Joi</a>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      header {
        margin: var(--size-3);
      }
      header > nav {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1em;
      }
      a {
        color: var(--blue-6);
        text-decoration: none;
        background-color: var(--blue-0);
        border: 1px solid var(--blue-1);
        text-shadow: 0 1px 0 var(--blue-2);
      }
      a:hover {
        background-color: var(--blue-1);
      }
    `,
  ],
})
export class AppComponent {}
