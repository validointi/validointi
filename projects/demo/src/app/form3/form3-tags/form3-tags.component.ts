import { Component, Input } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'label[tag][index]',
  standalone: true,
  imports: [FormsModule],
  template: `
    <span>Tag-{{ index }}</span>
    <input
      type="text"
      [name]="'tags[' + index + ']'"
      placeholder="Your tag"
      [(ngModel)]="tag"
    />
  `,
  styles: [
    `
      :host {
        display: label;
      }
    `,
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (form: NgForm) => form,
      deps: [NgForm],
    },
  ],
})
export class Form3TagsComponent {
  @Input() tag?: string;
  @Input() index?: number;
}
