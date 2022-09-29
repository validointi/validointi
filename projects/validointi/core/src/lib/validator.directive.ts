import { ChangeDetectorRef, Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, NgForm, ValidatorFn, ValidationErrors } from '@angular/forms';
import { asyncScheduler, BehaviorSubject, combineLatest, debounceTime, EMPTY, firstValueFrom, map, mapTo, merge, mergeAll, mergeMap, Observable, observeOn, of, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { ObjectFromRawFormValue } from './ObjectFromRawFormValue';
import { Model, ValidationFormatter, ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';

const relatedFields = Symbol('relatedfields');

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[validationId]',
  standalone: true,
  exportAs: 'validointi',
})
export class ValidatorDirective implements OnInit, OnDestroy {
  #state$ = new BehaviorSubject({
    validationId: '',
    validatorFn: undefined as unknown as Validator<any>,
    validateOnFieldChanges: false,
  });
  #refresh = new ReplaySubject<void>(1);
  @Input() set validationId(validationId: ValidationId) {
    const validatorFn = this.#vr.getValidator(validationId);
    this.#state$.next({ ...this.#state$.value, validationId, validatorFn });
  }
  @Input() set validateOnFieldChanges(value: boolean | '') {
    const validateOnFieldChanges = value === '' || value === true
    this.#state$.next({ ...this.#state$.value, validateOnFieldChanges });
  }
  #vr = inject(ValidatorRegistryService);
  #cdr = inject(ChangeDetectorRef)


  #form = inject(NgForm);
  #elm = inject(ElementRef) as ElementRef<HTMLFormElement>;

  validate = (key?: string): void => {
    const rawFormContent = this.#form.control.getRawValue();
    if (key) {
      const control = this.#form.control.get(key)!;
      this.#validateField({ key, control, newVal: control.value });
    } else {
      this.#validateForm(rawFormContent);
    }
  }

  /**
   * Use an mutationObserver to detect changes in the DOM, so we know there might be new controls to validate.
   * emits void on start and when the number of controls changes.
   */
  #formChanges = new Observable<void>(subscriber => {
    let lastLength = 0;
    const observer = new MutationObserver(() => {
      /** check the number of controls in the injected form */
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
  }).pipe(
    debounceTime(10),
    /** revalidate the entire form. if an field is added with invalid content, the form needs to be disabled now. */
    tap(() => this.validate())
  );

  /** helper to validate the whole form at once */
  #validateForm = async (rawFormContent: Model) => {
    this.#form.control.markAsPending();
    const { validatorFn } = await firstValueFrom(this.#state$)
    const errors = await validatorFn?.(ObjectFromRawFormValue(rawFormContent));
    console.dir(errors);
    if (errors) {
      for (const [key, control] of Object.entries(this.#form.controls)) {
        if (control.enabled) {
          // this.#cdr.markForCheck(); // make sure the error is shown
          if (errors[key]) {
            const errMsg = errToMsg(errors[key] as any);
            control.setErrors({ [key]: errMsg });
            control.markAsTouched();
            control.markAsDirty();
          } else {
            control.setErrors(null);
          }
          control.updateValueAndValidity();
        }

      }
    } else {
      // this will clear the pending state
      this.#form.control.setErrors(null);
    }
  }

  /** only when using full formValidation (and an actual form exits!) */
  #fullFormValidation = (this.#form.valueChanges || EMPTY).pipe(
    debounceTime(10), // dont fire too often
    tap(this.#validateForm),
  )

  /**
   * helper to validate a single control.
   * it will make sure that related fields are also updated in the view
   */
  #validateField = async ({ key, control, newVal }: {
    key: string;
    control: AbstractControl<any, any>;
    newVal: any;
  }) => {
    control.markAsPending();
    const { validatorFn } = await firstValueFrom(this.#state$)
    const formValue = ObjectFromRawFormValue(control.root.getRawValue());
    const errors = await validatorFn?.(formValue, key);
    const errKeys = Object.keys(errors || {});
    // @ts-ignore because we are dynamically adding a property to the control
    const related = control[relatedFields] ??= new Set<string>();
    related.add(key); // make sure we validate/clear this field to prevent from pending forever
    /** iterate over new errors, and previous fields that had one */
    errKeys.concat(...related).forEach((key) => {
      const currentCtrl = this.#form.controls[key];
      if (currentCtrl === undefined) {
        return;
      }
      if (errKeys.includes(key)) {
        const errMsg = errToMsg(errors[key] as any);
        if (currentCtrl.enabled) {
          // set the error, and make sure it surfaces to user by setting touched and dirty
          currentCtrl.setErrors({ [key]: errMsg });
          currentCtrl.markAllAsTouched();
          currentCtrl.markAsDirty();
          related.add(key);
        }
      } else {
        /** clear the error, and remove from list */
        related.delete(key);
        currentCtrl.setErrors(null);
      }
    })
  }

  /** subscribe to each model separate, when your validations are too slow otherwise. */
  #perControlValidation = this.#formChanges.pipe(
    observeOn(asyncScheduler),
    switchMap(() => of(Array.from(Object.entries(this.#form?.controls)))),
    switchMap((controls) => merge(...controls.map(([key, control]) => control.valueChanges.pipe(map((newVal) => ({ key, control, newVal })))))),
    debounceTime(10),
    tap(this.#validateField),
  )


  #unsubscribe = this.#refresh.pipe(
    switchMap(() => this.#state$),
    switchMap(({ validateOnFieldChanges }) => validateOnFieldChanges ?
      this.#perControlValidation :
      this.#fullFormValidation
    ),
  ).subscribe()

  ngOnDestroy(): void {
    this.#unsubscribe?.unsubscribe();
  }

  ngOnInit(): void {
    this.#refresh.next();
  }

}



function errToMsg(err: string | string[]): string {
  if (typeof err === 'string') {
    return err;
  }
  return err.join('/n');
}
