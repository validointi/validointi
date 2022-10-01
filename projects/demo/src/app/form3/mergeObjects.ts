const mergeObjects = (target: any = {}, source: any) => {
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      // merge(target[key] ??= [], source[key]);
      target[key] ??= [];
      source[key].forEach((item: any, index: number) => {
        if (item instanceof Object) {
          mergeObjects(target[key][index] ??= (Array.isArray(item) ? [] : {}), item);
        } else {
          target[key][index] = item;
        }
      });
    } else if (source[key] instanceof Object) {
      mergeObjects((target[key] ??= {}), source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};
