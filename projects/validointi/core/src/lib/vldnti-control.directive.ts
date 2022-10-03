import { Directive, HostListener, inject, Input, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import {  ValidatorDirective } from './validator.directive';
import { vldtniAbstractControl, VldtniAbstractControl } from './VldtiAbstractControl';





@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngModel]',
  standalone: true
})
export class VldntiControlDirective implements OnInit {
  #name$ = new BehaviorSubject('');
  @Input() set name(name: string) {  this.#name$.next(name); }
  @HostListener('focus')
  onFocus(target: HTMLInputElement) {
    this.validator.setLastFocus(this.control);
  }

  validator = inject(ValidatorDirective);
  ngModel= inject(NgModel);
  control = this.ngModel.control as unknown as VldtniAbstractControl;

  constructor() {
    // @ts-ignore
    // this.ngModel[vldtniAbstractControl] = true;
    this.control[vldtniAbstractControl] = true;
  }

  ngOnInit() {
    const name = this.#name$.value;
    if (!name) {
      throw new Error('[Validointi]: ngModel must have a name');
    }
  }

}
