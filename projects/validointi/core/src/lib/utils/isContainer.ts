import { ControlContainer, FormArray, FormGroup } from '@angular/forms';

export function isContainer(control: any): control is ControlContainer {
  return control instanceof FormGroup || control instanceof FormArray;
}
