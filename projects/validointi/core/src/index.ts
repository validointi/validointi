/*
 * Public API Surface of validointi
 */

import { ValidatorRegistryService } from './lib/validatorsRegistry.service';
//TODO: make sure we import this as _types_
import type { Model, ValidationErrors, ValidationFormatter, ValidationId } from './lib/validator.types';
import { ValidatorDirective } from './lib/validator.directive';
import { ObjectFromRawFormValue } from './lib/ObjectFromRawFormValue';

export {
  ValidatorRegistryService,
  ValidatorDirective,
  Model,
  ValidationErrors,
  ValidationFormatter,
  ValidationId,
  ObjectFromRawFormValue,
};
