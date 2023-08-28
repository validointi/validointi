import {
  vldtniAbstractControl,
  VldtniAbstractControl,
} from '../VldtiAbstractControl';

export function isVldtniControl(
  control: any
): control is VldtniAbstractControl {
  return control.hasOwnProperty(vldtniAbstractControl);
}
