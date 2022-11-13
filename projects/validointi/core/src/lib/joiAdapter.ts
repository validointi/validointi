import { ValidationErrors } from './validator.types';

interface JoiLike<T extends any> {
  validate<T extends any>(data: T): { error: any };
}

export function createJoiAdapter<T>(schema: JoiLike<T>) {
  return async (data: T) => {
    const { error } = schema.validate(data);
    if (error) {
      return (error.details as { path: string; message: string }[]).reduce(
        (acc, { path, message }) => ({ ...acc, [path]: [message] }),
        {} as ValidationErrors
      );
    }
    return {};
  };
}
