import {
  Directive,
  ElementRef,
  inject,
  Input,
  isDevMode,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlContainer, FormArray, FormGroup, NgForm } from '@angular/forms';
import {
  asyncScheduler,
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  firstValueFrom,
  map,
  merge,
  Observable,
  ReplaySubject,
  subscribeOn,
  switchMap,
  tap,
} from 'rxjs';
import { mergeObjects } from './ObjectFromRawFormValue';
import { objFromPath } from './objFromPath';
import { Model, ValidationId, Validator } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';
import {
  currentError,
  relatedFields,
  vldtniAbstractControl,
  VldtniAbstractControl,
} from './VldtiAbstractControl';

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
    controlList: [] as ControlList,
  });
  #refresh = new ReplaySubject<void>(1);
  @Input() set validationId(validationId: ValidationId) {
    const validatorFn = this.#vr.getValidator(validationId);
    this.#state$.next({ ...this.#state$.value, validationId, validatorFn });
  }
  @Input() set validateOnFieldChanges(value: boolean | '') {
    const validateOnFieldChanges = value === '' || value === true;
    this.#state$.next({ ...this.#state$.value, validateOnFieldChanges });
  }
  #debounceTime = 100;
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

  /**
   * Use an mutationObserver to detect changes in the DOM, so we know there might be new controls to validate.
   * emits void on start and when the number of controls changes.
   */
  #formChanges = this.#zone.runOutsideAngular(() =>
    new Observable<void>((subscriber) => {
      let lastLength = 0;
      const observer = new MutationObserver(() => {
        /** check the number of controls in the injected form */
        const newLength = Object.keys(this.#form.controls).length;
        if (lastLength !== newLength) {
          lastLength = newLength;
          subscriber.next(); // emit when the number of controls changes
        }
      });
      observer.observe(this.#elm.nativeElement, {
        attributes: false,
        childList: true,
        subtree: true,
      });
      subscriber.next(); //make sure we get start!
      return () => {
        observer.disconnect();
      };
    }).pipe(
      subscribeOn(asyncScheduler),
      debounceTime(this.#debounceTime),
      /** revalidate the entire form. if an field is added with invalid content, the form needs to be reexamined now. */
      tap(() => this.validate())
    )
  );

  /** helper to validate the whole form at once */
  #validateForm = async () => {
    this.#form.control.markAsPending({ onlySelf: false });
    const { validatorFn } = await firstValueFrom(this.#state$);
    const { controlList, formValue } = this.getFormData();
    const errors = await validatorFn?.(formValue);
    if (Object.keys(errors || {}).length) {
      for (const [key, control] of controlList as [
        keyof Model,
        VldtniAbstractControl
      ][]) {
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
  };

  /** only when using full formValidation (and an actual form exits!) */
  #fullFormValidation = this.#zone.runOutsideAngular(() =>
    (this.#form.valueChanges || EMPTY).pipe(
      debounceTime(this.#debounceTime), // dont fire too often
      tap(this.#validateForm)
    )
  );

  /**
   * helper to validate a single control.
   * it will make sure that related fields are also updated in the view
   */
  #validateField = async ({
    key,
    control,
  }: {
    key: string;
    control: VldtniAbstractControl;
  }) => {
    control.markAsPending();
    const { validatorFn } = await firstValueFrom(this.#state$);
    const { formEntries, formValue } = this.getFormData();
    const errors = await validatorFn?.(formValue, key);
    const errKeys = Object.keys(errors || {});
    const related = (control[relatedFields] ??= new Set<string>());
    related.add(key); // make sure we validate/clear this field to prevent from pending forever
    /** iterate over new errors, and previous fields that had one */
    new Set([...errKeys, ...related]).forEach((checkKey) => {
      const currentCtrl = formEntries[checkKey] as VldtniAbstractControl;
      if (currentCtrl === undefined) {
        if (isDevMode()) {
          console.warn(
            `[validointi] validated "${checkKey}" "${key}", but this doesn't seem to exists in this form!`
          );
        }
        return;
      }
      if (!currentCtrl.enabled) {
        currentCtrl.setErrors(null); // reset the pending when disabled during async validation.
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
        currentCtrl[currentError] = null;
      }
    });
    return control[currentError];
  };

  /** subscribe to each model separate, when your validations are too slow otherwise. */
  #perControlValidation = this.#zone.runOutsideAngular(() =>
    this.#formChanges.pipe(
      switchMap(() =>
        merge(
          ...flattenControls(this.#form)
            .filter(([_, ctrl]) => !isContainer(ctrl)) // only validate the leafs
            .map(([name, control]) =>
              control.valueChanges.pipe(map(() => ({ control, key: name })))
            )
        )
      ),
      debounceTime(this.#debounceTime),
      tap((r) => this.#zone.runOutsideAngular(() => this.#validateField(r)))
    )
  );

  getFormData = () => {
    const controlList = flattenControls(this.#form);
    const formEntries = Object.fromEntries(controlList);
    const leafControls = controlList.filter(([_, ctrl]) => !isContainer(ctrl));
    const formValue = leafControls.reduce(
      (acc, [path, control]) =>
        mergeObjects(acc, objFromPath(path as string, control.value)),
      {}
    ) as Model;
    return { controlList, formEntries, formValue };
  };

  #unsubscribe = this.#zone.runOutsideAngular(() =>
    this.#refresh
      .pipe(
        switchMap(() =>
          this.#state$.pipe(
            map(({ validateOnFieldChanges }) => validateOnFieldChanges),
            distinctUntilChanged() // only fire when this particular value changes
          )
        ),
        switchMap((validateOnFieldChanges) =>
          validateOnFieldChanges
            ? this.#perControlValidation
            : this.#fullFormValidation
        )
      )
      .subscribe()
  );

  ngOnDestroy(): void {
    /** always clean up after yourself */
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

function flattenControls(
  container: FormGroup | NgForm,
  preKey = '',
  result: ControlList = []
): ControlList {
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
