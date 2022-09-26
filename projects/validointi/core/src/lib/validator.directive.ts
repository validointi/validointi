import { Directive, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, NgForm, ValidatorFn,ValidationErrors } from '@angular/forms';
import { asyncScheduler, BehaviorSubject, debounceTime, EMPTY, merge, observeOn, of, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { ObjectFromRawFormValue } from './ObjectFromRawFormValue';
import { ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';


@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[validationId]',
  standalone: true
})
export class ValidatorDirective implements OnInit, OnDestroy {
  #refresh = new ReplaySubject<void>(1);
  @Input() validationId: ValidationId = '';
  #validateOnFieldChanges$ = new BehaviorSubject(false);;
  @Input() set validateOnFieldChanges(value: boolean | '') {
    this.#validateOnFieldChanges$.next(value === '' || value === true);
  }
  #validatorFn?: Validator<any>
  #vr = inject(ValidatorRegistryService);


  #form = inject(NgForm);// as unknown as FormGroup

  /** only when using full formValidation (and an actual form exits!) */
  #fullFormValidation = (this.#form?.valueChanges || EMPTY).pipe(
    debounceTime(10), // dont fire too often
    tap(async model => {
      console.log(model, ObjectFromRawFormValue(model));
      const errors = await this.#validatorFn?.(ObjectFromRawFormValue(model));
      if (errors) {
        Object.entries(errors).forEach(([key, value]) => {
          try {
            const control = this.#form.controls[key];
            control.setErrors({ [key]: value });
          } catch (e) {
            console.log('failed to set error on form control', { key, value });
            console.dir(this.#form.controls);
          }
        });
      }
    })
  )

  // TODO: this works, but if there are changes in the form, new/removed fields are not taken in account.
  /** subscribe to each model separate, when your validations are too slow otherwise. */
  #perControlValidation = this.#refresh.pipe(
    observeOn(asyncScheduler),
    switchMap(() => of(Array.from(Object.entries(this.#form?.controls)))),
    take(1),
    tap(controls => {
      controls.forEach(([key, control]) => {
        const validatorFn: AsyncValidatorFn = async (ctrl: AbstractControl) => {
          const currentFormData = ObjectFromRawFormValue(control.root.getRawValue())
          const errs = this.#validatorFn?.(currentFormData, key);
          if (!errs) {
            return null; //WTF? why is this not undefined?
          }
          return errs && Object.entries(errs).reduce((acc, [fieldname, err]) => ({ ...acc, [fieldname]: err }), {} as ValidationErrors);
        }
        if (!control.hasAsyncValidator(validatorFn)) {
          control.setAsyncValidators(validatorFn);
        }
        console.log('added validator to control', key);
      });
    })
  )


  #unsubscribe = this.#refresh.pipe(
    switchMap(() => this.#validateOnFieldChanges$),
    switchMap(validateOnFieldChanges => validateOnFieldChanges ?
      this.#perControlValidation :
      this.#fullFormValidation
    ),
    // tap((r) => console.log('validation done', r)),
  ).subscribe()



  ngOnDestroy(): void {
    this.#unsubscribe?.unsubscribe();
  }

  ngOnInit(): void {
    this.#validatorFn = this.#vr.getValidator(this.validationId);
    this.#refresh.next();
  }

}



