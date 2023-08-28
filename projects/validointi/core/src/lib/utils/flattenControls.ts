import { FormGroup, NgForm } from '@angular/forms';
import { VldtniAbstractControl } from '../VldtiAbstractControl';
import { ControlList } from '../validator.directive';

export function flattenControls(
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
