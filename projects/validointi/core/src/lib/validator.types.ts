export interface Model {
  [key: string]: any;
}

export type ValidationFormatter = <T extends Object>(data: T, errors: string | string[]) => string;

export interface ValidationErrors {
  [key: string]: unknown;
}

export type ValidationId = string;

export interface Validator<T extends Object> {
  (data: T, fieldName?: keyof T, group?: string): Promise<ValidationErrors>;
}
