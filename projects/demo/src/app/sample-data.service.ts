import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ValidationErrors, ValidatorRegistryService } from 'validator';
import { create, only, enforce, warn, test } from 'vest';


export interface SampleData {
  id: string;
  name: string;
  dob: Date;
  password: string;
  confirm: string;
  email: string;
}

const inMemoryDb = new Map<string, SampleData>();
inMemoryDb.set('1', {
  id: '1',
  name: 'Sander',
  dob: new Date(1980, 1, 1),
  password: '1234',
  confirm: '1234',
  email: 'none@oyb.eu'
})


@Injectable({
  providedIn: 'root'
})
export class SampleDataService {
  getById = (id: string) => of(inMemoryDb.get(id));
  getAll = () => of(Array.from(inMemoryDb.values()));
  #vr = inject(ValidatorRegistryService)

  validate = this.#vr.registerValidator('sample-data', validateSampleData);

  save = (data: SampleData) => {
    if (!isEmpty(this.validate(data))) {
      throw new Error(`can't save invalid data`);
    }
    inMemoryDb.set(data.id, data);
  }
}

const year = 365 * 24 * 60 * 60 * 1000
const suite = create((data: SampleData = {} as SampleData) => {

  test("id", "id is required", () => {
    enforce(data.id).isNotEmpty();
  });
  test("name", "name is too short", () => {
    enforce(data.name).longerThan(2);
  });

  test("dob", "must be older as 18", () => {
    const dob=new Date(data.dob)
    enforce(dob.getTime()).lessThanOrEquals(new Date(Date.now() - 18 * year).getTime());
  })

  test("dob", "Older then 80, are you sure?", () => {
    warn();
    const dob=new Date(data.dob)
    enforce(dob.getTime()).lessThanOrEquals(new Date(Date.now() - 80 * year).getTime());
  })

  test("password", "Password is required", () => {
    enforce(data.password).isNotEmpty();
  });
  test("password", "Password is too short", () => {
    enforce(data.password).longerThan(2);
  });
  test("password", "Password is weak. maybe add a number", () => {
    warn();
    enforce(data.password).matches(/[0-9]/);
  });

  test("confirm", "Passwords do not match", () => {
    enforce(data.confirm).equals(data.password);
  });
});

async function validateSampleData(data: SampleData): Promise<ValidationErrors> {
  const errors = await suite(data).getErrors();
  return Object.entries(errors).reduce((acc, [key, err]) => {
    acc[key] = err;
    return acc;
  }, {} as ValidationErrors);
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}
