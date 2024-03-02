import { object } from 'joi';
import { objFromPath } from './objFromPath';

/**
 * iterates over the source object, and creates the result object by copying the values from the source object.
 * it will handle paths in the source object, and create the target object accordingly.
 * @param model is the value as returned from `FromGroup.getRawValue()`
 * @returns an object where all the paths are converted and merged into a single object
 */
export const ObjectFromRawFormValue = (model: { [path: string]: any }): {} | [] | undefined => {
  const entries = Object.entries(model);
  if (entries.length === 0) {
    /** return undefined as we don't know what the caller would expect otherwise.  */
    return;
  }
  const firstPath = entries[0]?.[0];
  /** if we start of with numeric values, we should build an array, otherwise an object */
  const initialValue = Array.isArray(objFromPath(firstPath)) ? [] : {};
  return entries.reduce((acc, [key, value]) => {
    if (key === '') {
      throw new Error('[@validointi] Empty names in a form are not supported');
    }
    return mergeObjects(acc, objFromPath(key, value));
  }, initialValue);
};

/**
 * mutates the target object, by coping all the properties from the source object (recursively)
 * @param target
 * @param source
 * @returns reference to the target object
 */
export const mergeObjects = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      mergeArray((target[key] ??= []), source[key]);
    } else if (isObject(source[key])) {
      mergeObjects((target[key] ??= {}), source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

/**
 * Check if an value is an Object, and not a primitive,array or date
 * @param x any
 * @returns boolean
 */
const isObject = (x: any): x is Object => {
  if (typeof x !== 'object') return false; // rules out all primitives,symbols, and functions
  if (x === null) return false;
  if (Array.isArray(x)) return false;
  if (x instanceof Date) return false; // a date is an object, but for most purposes, it should be threated as a primitive
  return true;
};

/**
 * Mutates the target array, by adding the non-sparsely populated values from the source array
 * @param target array to merge into
 * @param source array to merge from
 * @returns reference to the target array
 */
const mergeArray = (target: any[], source: any[]) => {
  source.forEach((value, index) => {
    if (Array.isArray(value)) {
      mergeArray((target[index] ??= []), value);
    } else if (isObject(value)) {
      mergeObjects((target[index] ??= {}), value);
    } else {
      target[index] = value;
    }
  });
  return target;
};
