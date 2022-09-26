import { objFromPath } from './objFromPath';

describe('Objects from path', () => {
  it('should create an object from a path', () => {
    expect(objFromPath('a.b.c', 1)).toEqual({ a: { b: { c: 1 } } }); 
  });
  it('should create an object from a path with an array', () => {
    expect(objFromPath('a.0.b', 1)).toEqual({ a: [{ b: 1 }] });
  });
  it('should create an object from a path with an array and a number', () => {
    expect(objFromPath('a.0.b.1', 1)).toEqual({ a: [{ b: [undefined, 1] }] });
  });
  it('should create an object from a path with an array and a number', () => {
    expect(objFromPath('a[0].b[1]', 1)).toEqual({ a: [{ b: [undefined, 1] }] });
  });
})
