import { AbstractControl, ValidationErrors } from '@angular/forms';

export const relatedFields = Symbol('relatedfields');
export const currentError = Symbol('currentError');
export const vldtniAbstractControl = Symbol('vldtniAbstractControl');

export interface VldtniAbstractControl extends AbstractControl {
  [vldtniAbstractControl]: true;
  [relatedFields]: Set<string>;
  [currentError]: ValidationErrors | null;
}
