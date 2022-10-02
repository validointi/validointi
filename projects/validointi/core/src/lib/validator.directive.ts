import { Directive, ElementRef, inject, Input, isDevMode, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, NgForm, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, debounceTime, EMPTY, firstValueFrom, map, merge, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { ObjectFromRawFormValue } from './ObjectFromRawFormValue';
import { Model, ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';

const relatedFields = Symbol('relatedfields');
const currentError = Symbol('currentError');

interface VldtiAbstractControl extends AbstractControl {
  [relatedFields]?: Set<string>;
  [currentError]: ValidationErrors | null;
}

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

  /** injections */
  #vr = inject(ValidatorRegistryService);
  #form = inject(NgForm);
  #elm = inject(ElementRef) as ElementRef<HTMLFormElement>;
  #zone = inject(NgZone);

  validate = (key?: string): void => {
    const rawFormContent = this.#form.control.getRawValue();
    if (key) {
      const control = this.#form.control.get(key)!;
      this.#validateField({ key, control, newVal: control.value });
    } else {
      this.#validateForm(rawFormContent);
    }
  }

  /* Keep this as a spare for now. There might be a future use for it.

  #validatorFn: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const workControl = control as VldtiAbstractControl;
    workControl[currentError] && console.log('validatorFn', workControl[currentError]);
    return workControl[currentError] || null;
  }

  #asyncValidatorFn: AsyncValidatorFn = (absControl: AbstractControl): Promise<ValidationErrors | null> => {
    const control = absControl as VldtiAbstractControl;
    const key = Object.entries(this.#form.control.controls).find(([, c]) => c === absControl)?.[0]!;
    return this.#validateField({ key, control, newVal: control.value });
  }

  */

  /**
   * Use an mutationObserver to detect changes in the DOM, so we know there might be new controls to validate.
   * emits void on start and when the number of controls changes.
   */
  #formChanges = this.#zone.runOutsideAngular(() => new Observable<void>(subscriber => {
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
    debounceTime(100),
    /** make sure every field has an validator!
     * keep hooking up the validators in spare too, just in case.
    tap(() => Object.entries(this.#form.controls).forEach(([key, control]) => {
      if (!control.hasValidator(this.#validatorFn)) {
        control.setValidators(this.#validatorFn);
      }
      if (!control.hasAsyncValidator(this.#asyncValidatorFn)) {
        control.setAsyncValidators(this.#asyncValidatorFn);
      }
    })),

    /** revalidate the entire form. if an field is added with invalid content, the form needs to be reexamined now. */
    tap(() => this.validate())
  ));

  /** helper to validate the whole form at once */
  #validateForm = async (rawFormContent: Model) => {
    this.#form.control.markAsPending({ onlySelf: false });
    const { validatorFn } = await firstValueFrom(this.#state$)
    const errors = await validatorFn?.(ObjectFromRawFormValue(rawFormContent));
    if (errors) {
      for (const [key, control] of Object.entries(this.#form.controls) as [keyof Model, VldtiAbstractControl][]) {
        if (control.enabled) {
          if (errors[key]) {
            const errMsg = errToMsg(errors[key] as any);
            control[currentError] = { [key]: errMsg };
            control.setErrors({ [key]: errMsg });
          } else {
            control.setErrors(null);
            control[currentError] = null;
          }
        }
      }
    } else {
      // this will clear the pending state
      this.#form.control.setErrors(null);
    }
  }

  /** only when using full formValidation (and an actual form exits!) */
  #fullFormValidation = this.#zone.runOutsideAngular(() => (this.#form.valueChanges || EMPTY).pipe(
    debounceTime(10), // dont fire too often
    tap(this.#validateForm),
  ));

  /**
   * helper to validate a single control.
   * it will make sure that related fields are also updated in the view
   */
  #validateField = async ({ key, control, newVal }: {
    key: string;
    control: VldtiAbstractControl | AbstractControl;
    newVal: any;
  }) => {
    control = control as VldtiAbstractControl;
    control.markAsPending();
    const { validatorFn } = await firstValueFrom(this.#state$)
    const formValue = ObjectFromRawFormValue(control.root.getRawValue());
    console.dir({formValue});
    const errors = await validatorFn?.(formValue, key);
    console.dir({errors});
    const errKeys = Object.keys(errors || {});
    const related = (control as VldtiAbstractControl)[relatedFields] ??= new Set<string>();
    related.add(key); // make sure we validate/clear this field to prevent from pending forever
    /** iterate over new errors, and previous fields that had one */
    errKeys.concat(...related).forEach((key) => {
      const currentCtrl = this.#form.controls[key] as VldtiAbstractControl;
      if (currentCtrl === undefined) {
        if (isDevMode()) {
          console.warn(`[validointi] validated "${key}", but this doesn't seem to exists in this form!`);
        }
        return;
      }
      if (errKeys.includes(key)) {
        const errMsg = errToMsg(errors[key] as any);
        if (currentCtrl.enabled) {
          // set the error, and make sure it surfaces to user by setting touched and dirty
          currentCtrl.setErrors({ [key]: errMsg });
          currentCtrl[currentError] = { [key]: errMsg };
          related.add(key);
        }
      } else {
        /** clear the error, and remove from list */
        related.delete(key);
        currentCtrl.setErrors(null);
      }
    })
    return (control as VldtiAbstractControl)[currentError];
  }

  /** subscribe to each model separate, when your validations are too slow otherwise. */
  #perControlValidation = this.#zone.runOutsideAngular(() => this.#formChanges.pipe(
    switchMap(() => of(Array.from(Object.entries(this.#form?.controls)))),
    switchMap((controls) => merge(
      ...controls.map(([key, control]) => control.valueChanges.pipe(
        map((newVal) => ({ key, control, newVal }))
      ))
    )),
    debounceTime(25),
    tap((r) => this.#zone.runOutsideAngular(() => this.#validateField(r))),
  ))



  #unsubscribe = this.#zone.runOutsideAngular(() => this.#refresh.pipe(
    switchMap(() => this.#state$),
    switchMap(({ validateOnFieldChanges }) => validateOnFieldChanges ?
      this.#perControlValidation :
      this.#fullFormValidation
    ),
  ).subscribe())

  ngOnDestroy(): void {
    /** allways clean up after yourself */
    this.#unsubscribe?.unsubscribe();
  }

  ngOnInit(): void {
    /** start the whole process */
    this.#refresh.next();
  }

}

function errToMsg(err: string | string[]): string {
  if (typeof err === 'string') {
    return err;
  }
  return err.join('\n');
}
