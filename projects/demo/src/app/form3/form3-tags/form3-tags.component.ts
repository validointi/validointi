import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormsModule, NgForm, NgModel } from '@angular/forms';
import { VldntiControlDirective } from '@validointi/core';
import { ValidationErrorHookUpDirective } from '../../form1/validationErrorHookUp.directive';

@Component({
  selector: 'label[tag][index]',
  standalone: true,
  imports: [FormsModule, ValidationErrorHookUpDirective, VldntiControlDirective],
  template: `
      <span>Tag-{{index}}</span>
      <input
        type="text"
        [name]="'tags[' + index + ']'"
        placeholder="Your tag"
        [(ngModel)]="tag"
      />
  `,
  styles: [`
  :host {
    display: label;
  }
  `],
  viewProviders: [{ provide: ControlContainer, useFactory: (form: NgForm) => form, deps: [NgForm] }],
})
export class Form3TagsComponent {
  @Input() tag?: string;
  @Input() index?: number;
}
