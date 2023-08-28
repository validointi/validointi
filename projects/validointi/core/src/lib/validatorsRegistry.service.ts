import { Injectable } from '@angular/core';
import { Model, ValidationId, Validator } from './validator.types';

@Injectable({
  providedIn: 'root',
})
export class ValidatorRegistryService {
  #registry = new Map<ValidationId, Validator<any>>();

  registerValidator = <T extends Object>(name: ValidationId, fn: Validator<T>) => {
    this.#registry.set(name, fn);
    return this.getValidator(name);
  };

  getValidator = (name: ValidationId) => {
    const fn = this.#registry.get(name);
    if (!fn) {
      throw new Error(`No validator found with name "${name}"`);
    }
    return fn;
  };
}
