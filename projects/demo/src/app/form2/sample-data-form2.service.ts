import { inject, Injectable } from '@angular/core';
import { ValidationErrors, ValidatorRegistryService } from '@validointi/core';
import { of } from 'rxjs';
import { create, enforce, test } from 'vest';
import promisify from 'vest/promisify';

export interface SampleData {
  id: string;
  name: string;
  email: string;
}

const inMemoryDb = new Map<string, Partial<SampleData>>();
inMemoryDb.set('1', {
  id: '1',
  name: 'Luke Skywalker',
  email: 'jan@obi.com',
});

@Injectable({
  providedIn: 'root',
})
export class SampleDataForm2Service {
  getById = (id: string) => of(inMemoryDb.get(id));
  getAll = () => of(Array.from(inMemoryDb.values()));
  #vr = inject(ValidatorRegistryService);

  validate2 = this.#vr.registerValidator('sample-data2', validateData);

  save2 = async (data: Partial<SampleData>) => {
    const validationResult = await this.validate2(data);
    if (!isEmpty(validationResult)) {
      console.dir(validationResult);
      throw new Error(`can't save invalid data`);
    }
    inMemoryDb.set(data.id as string, data);
  };
}

const suite = promisify(
  create((data = {}) => {
    test('id', 'id is required', () => {
      enforce(data.id).isNotEmpty();
    });
    test('name', 'name is required', () => checkValueOnEndpoint(data.name));
    test('email', 'email is required', () => {
      enforce(data.email).isNotEmpty();
    });
  })
);

async function validateData(data: any) {
  const result = await suite(data);
  const errors = result.getErrors();
  return Object.entries(errors).reduce((acc, [key, err]) => {
    acc[key] = err;
    return acc;
  }, {} as ValidationErrors);
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}

async function checkValueOnEndpoint(item: any) {
  const response = await fetch('https://swapi.info/api/people');
  const items: SwapiPeople[] = await response.json();
  const results = items.map((person, index) => ({
    id: index,
    name: person.name,
  }));
  const hasError = results.filter((person) => person.name === item).length === 0;
  if (hasError) {
    /** this will reject the promise */
    throw new Error('Person is not on the list');
  }
  /** Everything is ok! Doing nothing here will return undefined */
}


export interface SwapiPeople {
  name:       string;
  height:     string;
  mass:       string;
  hair_color: string;
  skin_color: string;
  eye_color:  string;
  birth_year: string;
  gender:     Gender;
  homeworld:  string;
  films:      string[];
  species:    string[];
  vehicles:   string[];
  starships:  string[];
  created:    Date;
  edited:     Date;
  url:        string;
}

export enum Gender {
  Female = "female",
  Hermaphrodite = "hermaphrodite",
  Male = "male",
  NA = "n/a",
  None = "none",
}

