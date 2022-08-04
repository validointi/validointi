import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ValidationErrors, ValidatorRegistryService } from 'validator';
import { create, only, enforce, warn, test } from 'vest';


interface SampleData {
  id: string;
  name: string;
  dob: Date;
  password: string;
  confirm: string;
  email: string;
}

const inMemoryDb = new Map<string, SampleData>();



@Injectable({
  providedIn: 'root'
})
export class SampleDataService {
  getById = (id: string) => of(inMemoryDb.get(id));
  getAll = () => of(Array.from(inMemoryDb.values()));

  validate = this.vr.registerValidator('sample-data', validateSampleData);

  save = (data: SampleData) => {
    if (!isEmpty(this.validate(data))) {
      throw new Error(`can't save invalid data`);
    }
    inMemoryDb.set(data.id, data);
  }


  constructor(private vr: ValidatorRegistryService) { }
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
    enforce(data.dob.getTime()).lessThanOrEquals(new Date(Date.now() - 18 * year).getTime());
  })

  test("dob", "Older then 80, are you sure?", () => {
    warn();
    enforce(data.dob.getTime()).lessThanOrEquals(new Date(Date.now() - 80 * year).getTime());
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
