import { describe, expect, it } from 'vitest';
import { ObjectFromRawFormValue } from './ObjectFromRawFormValue';

const sample = {
  id: 1,
  name: 'Sander',
  email: '',
  dob: '1980-02-01',
  password: '1234',
  confirm: '1234',
  'address[0].street': '123 Main St',
  'address[0].city': 'Anytown',
  'address[0].state': 'CA',
  'address[0].zip': '12345',
  'address[0].primary': true,
  'address[0].tags': [1, 2, 3, { id: 1, name: 'Home' }],
  'address[1].street': '456 Main St',
  'address[1].city': 'another town',
  'address[1].state': 'NB',
  'address[1].zip': '54321',
  'address[1].primary': false,
  'address[1].tags': [3, 4, 5, { id: 1, name: 'tag1' }],
  'tags[0]': 'developer',
  'tags[1]': 'angular',
  'tags[4]': 'typescript',
  'nestArray[0][0][0]': 'a',
  'nestArray[0][0][1]': 'a',
  'nestArray[0][0][3]': 'a',
  'nestArray[0][1][0]': 'b',
  'nestArray[0][1][1]': 'b',
  'nestArray[0][1][3]': 'b',
  'nestArray[2][1][0]': 'c',
  'nestArray[2][1][1]': 'c',
  'nestArray[2][1][3]': 'c',
  'nestArray[3][0][0].a.b': 'c',
  'nestArray[3][0][1].a.b': 'c',
  'nestArray[3][0][3].a.b': 'c',
};

const result = ObjectFromRawFormValue(sample) as typeof expected;
const expected = {
  id: 1,
  name: 'Sander',
  email: '',
  dob: '1980-02-01',
  password: '1234',
  confirm: '1234',
  address: [
    {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      primary: true,
      tags: [1, 2, 3, { id: 1, name: 'Home' }],
    },
    {
      street: '456 Main St',
      city: 'another town',
      state: 'NB',
      zip: '54321',
      primary: false,
      tags: [3, 4, 5, { id: 1, name: 'tag1' }],
    },
  ],
  tags: ['developer', 'angular', , , 'typescript'],
  nestArray: [
    [
      ['a', 'a', , 'a'],
      ['b', 'b', , 'b'],
    ],
    ,
    [, ['c', 'c', , 'c']],
    [[{ a: { b: 'c' } }, { a: { b: 'c' } }, , { a: { b: 'c' } }]],
  ],
};

describe('Object from raw form value', () => {
  it('id should be number 1', () => {
    expect(result.id).toBe(1);
  });
  it('name should be Sander', () => {
    expect(result.name).toBe('Sander');
  });
  it('address should be array', () => {
    expect(Array.isArray(result.address)).toBe(true);
  });
  it('address should have 2 items', () => {
    expect(result.address.length).toBe(2);
  });
  it('address[0].street should be 123 Main St', () => {
    expect(result.address[0].street).toBe('123 Main St');
  });
  it('tags should be array', () => {
    expect(Array.isArray(result.tags)).toBe(true);
  });
  it('tags should have 5 length', () => {
    expect(result.tags.length).toBe(5);
  });
  it('tags[4] should be typescript', () => {
    expect(result.tags[4]).toBe('typescript');
  });
  it('result should match expected', () => {
    expect(result).toEqual(expected);
  });

  it('should work with an top level array', () => {
    const sample = {
      '[0]': 'a',
      '1': 'b',
      '[2]': 'c',
      '3': 'd',
      '4': 'e',
      '5': 'f',
      '6': 'g',
      '7': 'h',
      '8': 'i',
      '9': 'j',
    };
    const result = ObjectFromRawFormValue(sample) as string[];
    const expected = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    expect(result).toEqual(expected);
  });

  it('should return undefined when an empty object is handed over', () => {
    const sample = {};
    const result = ObjectFromRawFormValue(sample);
    expect(result).toBeUndefined();
  });

  it('should handle an array of objects', () => {
    const sample = {
      '0.name': 'Sander',
      '0.email': '',
      '1.name': 'Jeffrey',
      '1.email': '',
    };
    const result = ObjectFromRawFormValue(sample) as { name: string; email: string }[];
    const expected = [
      { name: 'Sander', email: '' },
      { name: 'Jeffrey', email: '' },
    ];
    expect(result).toEqual(expected);
  });

  it('Should error when there is an empty path', () => {
    const sample = {
      // apparently this is a valid key for an object.
      '': 'Sander',
    };
    // but we are not going to support it.
    expect(() => ObjectFromRawFormValue(sample)).toThrowError();
  });
});
