import { Directive, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { debounceTime, tap } from 'rxjs';
import { ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';


@Directive({
  selector: 'form[validationId]',
  standalone: true
})
export class ValidatorDirective implements OnInit, OnDestroy {
  @Input() validationId: ValidationId = '';
  #validatorFn?: Validator<any>
  #vr = inject(ValidatorRegistryService);


  #form = inject(NgForm)


  #unsubscribe = this.#form?.valueChanges?.pipe(
    debounceTime(10), // dont fire too often
    tap(async model => {
      const errors = await this.#validatorFn?.(model);
      if (errors) {
        Object.entries(errors).forEach(([key, value]) => {
          const formVal= this.#form.controls[key].getRawValue();;
          console.log({ key, value, formVal });
          this.#form.controls[key]?.setErrors({ [key]: value });
        });
      }
    })
  ).subscribe()



  ngOnDestroy(): void {
    this.#unsubscribe?.unsubscribe();
  }

  ngOnInit(): void {
    this.#validatorFn = this.#vr.getValidator(this.validationId);
  }

}
