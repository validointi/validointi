import { inject, Injectable } from '@angular/core';
import { ValidationErrors, ValidatorRegistryService } from '@se-ng/validate';
import { of } from 'rxjs';
import { create, enforce, only, optional, test, warn } from 'vest';

export interface SampleData {
  id: string;
  name: string;
  dob: Date;
  password: string;
  confirm: string;
  email: string;
  tags: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  }
}

const inMemoryDb = new Map<string, Partial<SampleData>>();
inMemoryDb.set('1', {
  id: '1',
  name: 'Sander',
  dob: new Date(1980, 1, 1),
  password: '1234',
  confirm: '1234',
  email: '',
  tags: ['developer', 'angular'],
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
  },
});

@Injectable({
  providedIn: 'root',
})
export class SampleDataService {
  getById = (id: string) => of(structuredClone(inMemoryDb.get(id)) as SampleData);
  getAll = () => of(Array.from(inMemoryDb.values() as unknown as SampleData[]));
  #vr = inject(ValidatorRegistryService);

  validate = this.#vr.registerValidator('sample-data', validateSampleData);

  save = async (data: Partial<SampleData>) => {
    const validationResult = await this.validate(data);
    if (!isEmpty(validationResult)) {
      console.dir(validationResult);
      throw new Error(`can't save invalid data`);
    }
    inMemoryDb.set(data.id as string, data);
  };
}
const year = 365 * 24 * 60 * 60 * 1000;
const suite = create((data: SampleData = {} as SampleData, field?: string) => {

  only(field);

  test('id', 'id is required', () => {
    enforce(data.id).isNotEmpty();
  });
  test('name', 'name is too short', () => {
    enforce(data.name).longerThan(2);
  });
  test('email', 'email is required', () => {
    enforce(data.email).isNotEmpty();
  });

  test('dob', 'must be older as 18', () => {
    const dob = new Date(data.dob);
    enforce(dob.getTime()).lessThanOrEquals(
      new Date(Date.now() - 18 * year).getTime()
    );
  });

  test('dob', 'Older then 80, are you sure?', () => {
    warn();
    const dob = new Date(data.dob);
    enforce(dob.getTime()).lessThanOrEquals(
      new Date(Date.now() - 80 * year).getTime()
    );
  });

  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
  test('password', 'Password is too short', () => {
    enforce(data.password).longerThan(2);
  });
  test('password', 'Password is weak. maybe add a number', () => {
    warn();
    enforce(data.password).matches(/[0-9]/);
    enforce(data.password).longerThanOrEquals(6);
  });

  test('confirm', 'Passwords do not match', () => {
    enforce(data.confirm).equals(data.password);
  });

  const address = data.address || {};

  test('address.street', 'Street is required', () => {
    enforce(address.street).isNotEmpty();
  });

  test('address.city', 'City is required', () => {
    enforce(address.city).isNotEmpty();
  });

  test('address.city', 'City must contain any', () => {
    enforce(address.city).condition((city: string) => city.toLocaleLowerCase().includes('any'));
  });

  const tags = data.tags || [];
  for (let [ index, value ] of tags.entries()) {
    test(`tags[${index}]`, 'tag is required', () => {
      enforce(value).isNotEmpty();
    });

    test(`tags[${index}]`, 'tag needs to be unique', () => {
      enforce(value).condition((tag: string) => tags.filter(t => t === tag).length === 1);
    });
  }


});

async function validateSampleData(data: SampleData, field?: string): Promise<ValidationErrors> {
  const errors = await suite(data, field).getErrors();
  return Object.entries(errors).reduce((acc, [key, err]) => {
    acc[key] = err;
    return acc;
  }, {} as ValidationErrors);
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}
