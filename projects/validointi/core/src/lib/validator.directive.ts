import { Directive, ElementRef, inject, Input, isDevMode, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlContainer, FormArray, FormControl, FormGroup, NgForm, NgModelGroup, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilKeyChanged, EMPTY, firstValueFrom, map, merge, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { ObjectFromRawFormValue } from './ObjectFromRawFormValue';
import { Model, ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';
import { currentError, relatedFields, vldtniAbstractControl, VldtniAbstractControl } from './VldtiAbstractControl';


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
    controlList: [] as ControlList
  });
  #refresh = new ReplaySubject<void>(1);
  #lastFocus$ = new ReplaySubject<AbstractControl>(1);
  @Input() set validationId(validationId: ValidationId) {
    const validatorFn = this.#vr.getValidator(validationId);
    this.#state$.next({ ...this.#state$.value, validationId, validatorFn });
  }
  @Input() set validateOnFieldChanges(value: boolean | '') {
    const validateOnFieldChanges = value === '' || value === true
    this.#state$.next({ ...this.#state$.value, validateOnFieldChanges });
  }
  #debounceTime = 250
  @Input() set vldtiDebounceTime(value: number) {
    if (typeof value === 'number') this.#debounceTime = value;
  }

  /** injections */
  #vr = inject(ValidatorRegistryService);
  #form = inject(NgForm);
  #elm = inject(ElementRef) as ElementRef<HTMLFormElement>;
  #zone = inject(NgZone);

  /** get the complete path name of a control */
  getMyName(control: VldtniAbstractControl) {
    const fields = flattenControls(this.#form.control);
    const field = fields.find(([key, f]) => f === control)!;
    return field[0];
  }

  setLastFocus(control: AbstractControl) {
    this.#lastFocus$.next(control);
  }

  /**
   * Exported method to trigger validation manually.
   * @param controlName Optional- name of the control to validate, if not provided whole form is validated.
   */
  validate = async (key?: string): Promise<void> => {
    const rawFormContent = this.#form.control.getRawValue();
    if (key) {
      const control = this.#form.control.get(key)! as VldtniAbstractControl;
      this.#validateField(control);
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
    debounceTime(this.#debounceTime),
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
    const formEntries = flattenControls(this.#form);
    if (Object.keys(errors || {}).length) {
      for (const [key, control] of formEntries as [keyof Model, VldtniAbstractControl][]) {
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
    debounceTime(this.#debounceTime), // dont fire too often
    tap(this.#validateForm),
  ));

  /**
   * helper to validate a single control.
   * it will make sure that related fields are also updated in the view
   */
  #validateField = async (control: VldtniAbstractControl) => {
    control.markAsPending();
    const { validatorFn } = await firstValueFrom(this.#state$)
    const formValue = ObjectFromRawFormValue(control.root.getRawValue());
    const controlList = flattenControls(this.#form)
    const formEntries = Object.fromEntries(controlList);
    const key = this.getMyName(control);
    const errors = await validatorFn?.(formValue, key);
    const errKeys = Object.keys(errors || {});
    const related = control[relatedFields] ??= new Set<string>();
    related.add(key); // make sure we validate/clear this field to prevent from pending forever
    /** iterate over new errors, and previous fields that had one */
    new Set([...errKeys, ...related]).forEach((checkKey) => {
      const currentCtrl = formEntries[checkKey] as VldtniAbstractControl;
      if (currentCtrl === undefined) {
        if (isDevMode()) {
          console.warn(`[validointi] validated "${checkKey}" "${key}", but this doesn't seem to exists in this form!`);
        }
        return;
      }
      if (!currentCtrl.enabled) {
        return;
      }
      if (errKeys.includes(checkKey)) {
        const errMsg = errToMsg(errors[checkKey] as any);
        // set the error, and make sure it surfaces to user by setting touched and dirty
        currentCtrl.setErrors({ [checkKey]: errMsg });
        currentCtrl[currentError] = { [checkKey]: errMsg };
        related.add(checkKey);
      } else {
        /** clear the error, and remove from list */
        related.delete(checkKey);
        currentCtrl.setErrors(null);
      }
    })
    return control[currentError];
  }

  /** subscribe to each model separate, when your validations are too slow otherwise. */
  #perControlValidation = this.#zone.runOutsideAngular(() => this.#formChanges.pipe(
    switchMap(() => merge(
      ...flattenControls(this.#form)
        .map(([_, control]) => control.valueChanges.pipe(
          map(() => (control)))
        ))
    ),
    debounceTime(this.#debounceTime),
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

function isContainer(control: any): control is ControlContainer {
  return control instanceof FormGroup || control instanceof FormArray;
}

function isVldtniControl(control: any): control is VldtniAbstractControl {
  return control.hasOwnProperty(vldtniAbstractControl);
}


type ControlList = [string, VldtniAbstractControl][];

function flattenControls(container: FormGroup | NgForm, preKey = '', result: ControlList = []): ControlList {
  if (container instanceof NgForm) {
    return flattenControls(container.form, preKey, result);
  }
  for (const [key, control] of Object.entries(container.controls)) {
    const fieldKey = `${preKey}${key}`;
    if (result.findIndex(([k]) => k === fieldKey) !== -1) {
      console.warn(`[validointi] duplicate name "${fieldKey}" found!`);
    }
    result.push([fieldKey, control as VldtniAbstractControl]);
    if (control instanceof FormGroup) {
      flattenControls(control, `${fieldKey}.`, result);
    }
  }
  return result;
}
