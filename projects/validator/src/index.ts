/*
 * Public API Surface of validator
 */

import { ValidatorRegistryService } from './lib/validatorsRegistry.service';
//TODO: make sure we import this as _tyes_
import type { Model, ValidationErrors, ValidationFormatter, ValidationId } from './lib/validator.types';
import { ValidatorDirective } from './lib/validator.directive';

export {
  ValidatorRegistryService,
  ValidatorDirective,
  Model,
  ValidationErrors,
  ValidationFormatter,
  ValidationId
};
