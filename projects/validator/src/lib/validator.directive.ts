import { Directive, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Form, NgForm } from '@angular/forms';
import { create } from 'vest';
import { ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';
import { debounceTime, tap } from 'rxjs';


@Directive({
  selector: 'form[ValidationId]',
  standalone: true
})
export class ValidatorDirective implements OnInit, OnDestroy {
  @Input() ValidationId: ValidationId = '';
  #validatorFn?: Validator<any>
  #vr = inject(ValidatorRegistryService);
  #form = inject(NgForm)


  #unsubscribe = this.#form?.valueChanges?.pipe(
    debounceTime(10), // dont fire too often
    tap(model => {
      const errors = this.#validatorFn?.(model);
      errors && Object.entries(errors).forEach(([key, value]) => {
        this.#form.controls[key].setErrors(value);
      })
    })
  ).subscribe()



  ngOnDestroy(): void {
    this.#unsubscribe?.unsubscribe();
  }

  ngOnInit(): void {
    this.#validatorFn = this.#vr.getValidator(this.ValidationId);
  }

}
