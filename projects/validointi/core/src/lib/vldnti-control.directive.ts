import { Directive, inject, input, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ValidatorDirective } from './validator.directive';
import { vldtniAbstractControl, VldtniAbstractControl } from './VldtiAbstractControl';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngModel]',
  standalone: true,
})
export class VldntiControlDirective {
  name = input.required<string>();

  validator = inject(ValidatorDirective);
  ngModel = inject(NgModel);
  control = this.ngModel.control as unknown as VldtniAbstractControl;

  constructor() {
    this.control[vldtniAbstractControl] = true;
  }
}
