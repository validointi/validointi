import { ValidationErrors } from './validator.types';

interface VestLike<T> {
  (data: T | undefined, field?: string): any;
}

export function createVestAdapter<T>(suite: VestLike<T>) {
  return async (data: T, field?: any) => {
    const errors = (await suite(data, field)).getErrors() as Record<string, string[]>;
    return Object.entries(errors).reduce((acc, [key, err]) => ({ ...acc, [key]: err }), {} as ValidationErrors);
  };
}
