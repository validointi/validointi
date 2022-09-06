export interface Model {
  [key: string]: any;
}

export type ValidationFormatter = <T extends Object>(
  data: T,
  errors: string | string[]
) => string;

export interface ValidationErrors {
  [key: string]: undefined | string | string[] | ValidationFormatter;
}

export type ValidationId = string;

export interface Validator<T extends Object> {
  (data: T): Promise<ValidationErrors>;
}
