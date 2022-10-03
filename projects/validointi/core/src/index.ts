/*
 * Public API Surface of validointi
 */

import { ValidatorRegistryService } from './lib/validatorsRegistry.service';
//TODO: make sure we import this as _types_
import type { Model, ValidationErrors, ValidationFormatter, ValidationId } from './lib/validator.types';
import { ValidatorDirective } from './lib/validator.directive';
import { FormErrorDirective } from './lib/form-error.directive';
import { ControlErrorDirective} from './lib/control-error.directive';
import { ObjectFromRawFormValue } from './lib/ObjectFromRawFormValue';

export {
  ValidatorRegistryService,
  ValidatorDirective,
  FormErrorDirective,
  ControlErrorDirective,
  Model,
  ValidationErrors,
  ValidationFormatter,
  ValidationId,
  ObjectFromRawFormValue,
};
