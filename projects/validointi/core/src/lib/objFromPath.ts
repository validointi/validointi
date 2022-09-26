/**
 * takes a string, and a value, and returns an object with the value at the path
 *
 * @param path a string in the format like `a.b.c` or `a[0].b[1].c`
 * @param value optional, can be any value
 * @returns an object with the value at the path. `a.b.c` will return `{ a: { b: { c: value } } }`
 */
export const objFromPath = <T>(path: string, value?: unknown): T => {
  const parts = path.split(/[\[\]\.]/).filter((p) => p).reverse();
  return parts.reduce((acc, part) => {
    const index = parseInt(part, 10);
    if (isNaN(index)) {
      return { [part]: acc };
    }
    const newArr: unknown[] = [];
    newArr[index] = acc;
    return newArr;
  }, value) as T;
}
