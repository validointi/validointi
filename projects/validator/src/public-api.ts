/*
 * Public API Surface of validator
 */

export * from './lib/validator.directive';

export interface Model {
  [key: string]: any;
}

export type ValidationFormatter = (
  data: Model,
  errors: string | string[]
) => string;

export interface ValidationErrors {
  [key: keyof Model]: undefined | string | string[] | ValidationFormatter;
}

export type ValidationId = string;

export interface Validator {
  (data: Model, id: ValidationId): ValidationErrors;
}
