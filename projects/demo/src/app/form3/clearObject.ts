export const clearObject = (obj: any) => {
  for (const key of Object.keys(obj)) {
    if (key === 'id') continue;
    if (Array.isArray(obj[key])) {
      obj[key].forEach((item: any, index: number, a: any[]) => {
        a[index] = undefined;
      });
      obj[key].length = 0; // throw away all the items
      obj[key] = []; // replace with a new reference to a new array
    } else if (obj[key] instanceof Object) {
      clearObject(obj[key]);
    } else {
      obj[key] = undefined;
    }
  }
};
