import {
  afterNextRender,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
  NgZone,
  signal,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { debounceTime, type Subscription } from 'rxjs';
import { mergeObjects } from './ObjectFromRawFormValue';
import { objFromPath } from './objFromPath';
import { flattenControls } from './utils/flattenControls';
import { isContainer } from './utils/isContainer';
import { Model } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';
import { currentError, relatedFields, VldtniAbstractControl } from './VldtiAbstractControl';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[validationId]',
  standalone: true,
  exportAs: 'validointi',
})
export class ValidatorDirective {
  validationId = input.required<string>();
  validateOnFieldChanges = input(false, {
    transform: (v: string | boolean) => v === '' || v === true,
  });
  vldtiDebounceTime = input(100);
  validatorFn = computed(() => this.#vr.getValidator(this.validationId()));

  /** injections */
  #vr = inject(ValidatorRegistryService);
  #form = inject(NgForm);
  #elm = inject(ElementRef) as ElementRef<HTMLFormElement>;
  #des = inject(DestroyRef);

  /** get the complete path name of a control */
  getMyName(control: VldtniAbstractControl) {
    const fields = flattenControls(this.#form.control);
    const field = fields.find(([key, f]) => f === control)!;
    return field[0];
  }

  /**
   * Exported method to trigger validation manually.
   * @param controlName Optional- name of the control to validate, if not provided whole form is validated.
   */
  validate = async (key?: string): Promise<void> => {
    if (key) {
      const control = this.#form.control.get(key)! as VldtniAbstractControl;
      this.#validateField({ key, control });
    } else {
      this.#validateForm();
    }
  };

  /** helper to validate the whole form at once */
  #validateForm = async () => {
    this.#form.control.markAsPending({ onlySelf: false });
    const { controlList, formValue } = this.getFormData();
    const errors = await this.validatorFn()(formValue);
    for (const [key, control] of controlList as [keyof Model, VldtniAbstractControl][]) {
      if (control.enabled) {
        if (errors[key]) {
          const errs = errors[key];
          control[currentError] = { [key]: errs };
          control.setErrors({ [key]: errs });
        } else {
          control.setErrors(null);
          control[currentError] = null;
        }
      }
    }
    // this will clear the pending state, just in case nothing was updated
    if (Object.entries(errors).length === 0) {
      this.#form.control.setErrors(null);
    }
  };

  /**
   * helper to validate a single control.
   * it will make sure that related fields are also updated in the view
   */
  #validateField = async ({ key, control }: { key: string; control: VldtniAbstractControl }) => {
    control.markAsPending();
    const validatorFn = this.validatorFn();
    const { formEntries, formValue } = this.getFormData();
    const errors = await validatorFn(formValue, key);
    const errKeys = Object.keys(errors || {});
    const related = (control[relatedFields] ??= new Set<string>());
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
        currentCtrl.setErrors(null); // reset the pending when disabled during async validation.
        return;
      }
      if (errKeys.includes(checkKey)) {
        const errs = errors[checkKey];
        // set the error, and make sure it surfaces to user by setting touched and dirty
        currentCtrl.setErrors({ [checkKey]: errs });
        currentCtrl[currentError] = { [checkKey]: errs };
        related.add(checkKey);
      } else {
        /** clear the error, and remove from list */
        related.delete(checkKey);
        currentCtrl.setErrors(null);
        currentCtrl[currentError] = null;
      }
    });
    return control[currentError];
  };

  getFormData = () => {
    const controlList = flattenControls(this.#form);
    const formEntries = Object.fromEntries(controlList);
    const leafControls = controlList.filter(([_, ctrl]) => !isContainer(ctrl));
    const formValue = leafControls.reduce(
      (acc, [path, control]) => mergeObjects(acc, objFromPath(path as string, control.value)),
      {}
    ) as Model;
    return { controlList, formEntries, formValue };
  };

  #numberOfControls = signal(0);
  constructor() {
    const subs: Subscription[] = [];
    this.#des.onDestroy(() => {
      subs.forEach((s) => s.unsubscribe());
    });
    effect(async () => {
      const validateOnFieldChanges = this.validateOnFieldChanges();
      const numberOfControls = this.#numberOfControls();
      subs.forEach((s) => s.unsubscribe()); // clean up eventual previous subscriptions
      subs.length = 0; // reset the array
      if (numberOfControls === 0) {
        return;
      }
      await this.#validateForm(); // initial validation, also run this when fields are added/removed
      if (validateOnFieldChanges) {
        /** subscribe to each control valuechanges separate, when your validations are too slow otherwise. */
        flattenControls(this.#form.control).forEach(([key, control]) => {
          subs.push(
            control
              .valueChanges!.pipe(debounceTime(this.vldtiDebounceTime()))
              .subscribe(() => this.#validateField({ key, control }))
          );
        });
      } else {
        /** listen for value-changes on the whole form to trigger. */
        subs.push(this.#form.valueChanges!.pipe(debounceTime(this.vldtiDebounceTime())).subscribe(this.#validateForm));
      }
    });

    afterNextRender(() => {
      const elm = this.#elm.nativeElement;
      /**
       * the native DOM form element has a property `elements` that is a
       * live collection of all the controls in the form.
       * That means it will change when controls are added or removed, no matter
       * how deeply nested they are.
       * we update the signal for every event that might trigger a change.
       * using a signal means this will be debounced, and only trigger the above
       * effect once.
       */
      const change = (ev: Event) => this.#numberOfControls.set(elm.elements.length); // update the number of controls
      elm.addEventListener('change', change);
      elm.addEventListener('input', change);
      elm.addEventListener('click', change);
    });
  }
}
export type ControlList = [string, VldtniAbstractControl][];
