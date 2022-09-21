import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ValidationErrorHookUpDirective } from '../../form1/validationErrorHookUp.directive';

@Component({
  selector: 'label[tag][index]',
  standalone: true,
  imports: [FormsModule, ValidationErrorHookUpDirective],
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
})
export class Form3TagsComponent implements OnInit {
  @Input() tag?: string;
  @Input() index?: number;

  /**
   * those 2 are needed to register the control in the form
   */
  @ViewChild(NgModel, { static: true }) ngModel!: NgModel;
  form = inject(NgForm);

  constructor() { }

  ngOnInit(): void {
    /**
     * this is a bit of a chore, but we need to add the control to the form manually,
     * because when we are in a child component of a form, Angular doesn't do this for us somehow???
     * that thus requires us to inject the form, and use viewchild to get ngModel, and then add the control to the form
     * (When we have it, we can also se it to set the name of the control, which is used in the error messages)
     */
    this.form.addControl(this.ngModel);
  }
}
