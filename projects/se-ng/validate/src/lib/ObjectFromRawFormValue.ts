import { objFromPath } from './objFromPath';

/**
 *
 * @param model is the value as returned from `FromGroup.getRawValue()`
 * @returns an object where all the paths are converted and merged into a single object
 */
export const ObjectFromRawFormValue = (model: { [key: string]: any; }): {} => {
  return Object.entries(model).reduce((acc, [key, value]) => {
    return mergeObjects(acc, objFromPath(key, value));
  }, {});
}

const mergeObjects = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      mergeArray(target[key] ??= [], source[key]);
    }
    else if (source[key] instanceof Object) {
      mergeObjects(target[key] ??= {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

function mergeArray(target: any[], source: any[]) {
  source.forEach((value, index) => {
    target[index] = value;
  });
  return target;
}
