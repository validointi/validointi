import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, NgForm, ValidatorFn, ValidationErrors } from '@angular/forms';
import { asyncScheduler, BehaviorSubject, debounceTime, EMPTY, merge, mergeMap, Observable, observeOn, of, ReplaySubject, switchMap, take, tap } from 'rxjs';
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


  #form = inject(NgForm);
  #elm = inject(ElementRef<HTMLFormElement>);

  #formChanges = new Observable<void>(subscriber => {
    let lastLength = 0;
    const observer = new MutationObserver(() => {
      const newLength = Object.keys(this.#form.controls).length;
      if (lastLength !== newLength) {
        lastLength = newLength;
        subscriber.next();// emit when the number of controls changes
      }
    });
    observer.observe(this.#elm.nativeElement, { attributes: false, childList: true, subtree: true });
    subscriber.next(); //make sure we get start!
    return () => {
      observer.disconnect()
    };
  }).pipe(debounceTime(10));




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
  #perControlValidation = this.#formChanges.pipe(
    observeOn(asyncScheduler),
    switchMap(() => of(Array.from(Object.entries(this.#form?.controls)))),
    tap(controls => {
      controls.forEach(([key, control]) => {
        const validatorFn = this.#getValidatorFn(key);
        if (!control.hasAsyncValidator(validatorFn)) {
          console.log('adding validator to control', key);
          control.setAsyncValidators(validatorFn);
        }
        // console.log('added validator to control', key);
      });
    })
  )

  #controlValidatorns = new Map<string, AsyncValidatorFn>();
  #getValidatorFn(key: string): AsyncValidatorFn {
    if (!this.#controlValidatorns.has(key)) {
      const validatorFn: AsyncValidatorFn = async (ctrl: AbstractControl) => {
        const currentFormData = ObjectFromRawFormValue(ctrl.root.getRawValue())
        const errs = await this.#validatorFn?.(currentFormData, key);
        if (Object.keys(errs || {}).length === 0) {
          return null; //WTF? why is this not undefined?
        }
        return Object.entries(errs!).reduce((acc, [fieldname, err]) => ({ ...acc, [fieldname]: err }), {} as ValidationErrors);
      }
      this.#controlValidatorns.set(key, validatorFn);
    }
    return this.#controlValidatorns.get(key)!;
  }


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



