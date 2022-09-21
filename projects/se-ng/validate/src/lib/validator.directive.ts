import { Directive, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { asyncScheduler, BehaviorSubject, debounceTime, EMPTY, merge, observeOn, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { ObjectFromRawFormValue } from './ObjectFromRawFormValue';
import { ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';


@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[validationId]',
  standalone: true
})
export class ValidatorDirective implements OnInit, OnDestroy {
  #init = new ReplaySubject<void>(1);
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
      console.log(model,ObjectFromRawFormValue(model));
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

  /** subscribe to each model separate, when your validations are too slow otherwise. */
  #perControlValidation = this.#init.pipe(
    observeOn(asyncScheduler),
    switchMap(() => of(Array.from(Object.entries(this.#form?.controls)))),
    switchMap(model => merge(...model.map(([fieldName, control]) => control.valueChanges.pipe(
      debounceTime(10), // dont fire too often
      switchMap((newValue) => this.#validatorFn?.(ObjectFromRawFormValue(control.root.getRawValue()), fieldName) || EMPTY),
      tap(errors => {
        const fieldErrors = errors?.[fieldName];
        if (fieldErrors) {
          control.setErrors({ [fieldName]: fieldErrors });
        }
      })
    ))))
  )


  #unsubscribe = this.#init.pipe(
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
    this.#init.next();
    this.#init.complete();
  }

}



