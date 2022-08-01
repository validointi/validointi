import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ValidatorDirective } from 'projects/validator/src/public-api';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ValidatorDirective],
  template: `
    <code> {{ nameForm.errors | json }} </code>
    <form #nameForm="ngForm" [validateForm]="schema">
      <h1>Please fill in the form fields</h1>
      <label for="name">Name:</label>
      <input
        type="text"
        name="name"
        [(ngModel)]="model.name"
        placeholder="Fill in the name"
      />
    </form>
  `,
})
export class HomeComponent {
  @ViewChild(NgForm) form!: NgForm;
  model = { name: '' };
  schema = {};
}
