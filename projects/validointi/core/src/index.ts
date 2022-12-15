/*
 * Public API Surface of validointi
 */

import { ValidatorRegistryService } from './lib/validatorsRegistry.service';
//TODO: make sure we import this as _types_
import { vldntiDirectives } from './lib/directives';
import { ObjectFromRawFormValue } from './lib/ObjectFromRawFormValue';
import { ValidatorDirective } from './lib/validator.directive';
import type { Model, ValidationErrors, ValidationFormatter, ValidationId } from './lib/validator.types';
import { VldntiControlDirective } from './lib/vldnti-control.directive';
import { createVestAdapter } from './lib/vestAdapter';
import { createJoiAdapter } from './lib/joiAdapter';

export {
  ValidatorRegistryService,
  ValidatorDirective,
  VldntiControlDirective,
  Model,
  ValidationErrors,
  ValidationFormatter,
  ValidationId,
  ObjectFromRawFormValue,
  createVestAdapter,
  createJoiAdapter,
  vldntiDirectives
};
