import { Component, input } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { VldntiControlDirective } from '@validointi/core';
import { ValidationErrorHookUpDirective } from '../../form1/validationErrorHookUp.directive';

@Component({
  selector: 'label[tag][index]',
  standalone: true,
  imports: [FormsModule, ValidationErrorHookUpDirective, VldntiControlDirective],
  template: `
    <span>Tag-{{ index() }}</span>
    <input type="text" [name]="'tags[' + index() + ']'" placeholder="Your tag" [ngModel]="tag()" />
    changeDetection: ChangeDetectionStrategy.OnPush,
  `,
  styles: [
    `
      :host {
        display: label;
      }
    `,
  ],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class Form3TagsComponent {
  readonly tag = input<string>();
  readonly index = input<number>();
}
