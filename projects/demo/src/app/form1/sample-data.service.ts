import { inject, Injectable } from '@angular/core';
import { ValidationErrors, ValidatorRegistryService } from '@validointi/core';
import { of } from 'rxjs';
import { create, each, enforce, include, only, test, warn } from 'vest';

export interface SampleData {
  id: string;
  name: string;
  dob: Date;
  password: string;
  confirm: string;
  tags: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  }
  contacts: SampleDataContactDetail[];
}

export enum SampleDataContactDetailType {
  Email = 'E-Mail',
  Fax = 'Fax',
  Mobile = 'Mobile',
  Phone = 'Phone',
}

export interface SampleDataContactDetail {
  type: SampleDataContactDetailType;
  value: string;
  priority: number;
}

const inMemoryDb = new Map<string, Partial<SampleData>>();
inMemoryDb.set('1', {
  id: '1',
  name: 'Sander',
  dob: new Date(1980, 1, 1),
  password: '1234',
  confirm: '1234',
  contacts: [
    { type: SampleDataContactDetailType.Email, value: 'a@b.c', priority: 0 },
    { type: SampleDataContactDetailType.Mobile, value: '+31 6123 456 789', priority: 0 },
  ],
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
  getAll = () => of(structuredClone(Array.from(inMemoryDb.values() as unknown as SampleData[])));
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

async function validateSampleData(data: SampleData, field?: string): Promise<ValidationErrors> {
  const errors = await suite(data, field).getErrors();
  return Object.entries(errors).reduce((acc, [key, err]) => {
    acc[key] = err;
    return acc;
  }, {} as ValidationErrors);
}


const year = 365 * 24 * 60 * 60 * 1000;
/**
 * we use vest in ["stateless" mode](https://vestjs.dev/docs/understanding_state#solution-treat-validations-as-stateless)
 * because we have arrays and objects in our data structure, and we want to be able to validate a single field.
 */
const suite = (data: SampleData = {} as SampleData, field?: string) => create(() => {

  if (field !== undefined) {
    only(field);
    if (field.startsWith('tags')) {
      for (let i = 0; i < data.tags.length; i++) {
        include(`tags[${i}]`);
      }
    }
    if (field = 'password') {
      include('confirm');
    }
  }

  test('id', 'id is required', () => {
    enforce(data.id).isNotEmpty();
  });
  test('name', 'name is too short', () => {
    enforce(data.name).longerThan(2);
  });

  test('contacts', 'There must be at least 1 contact', () => {
    enforce(data.contacts.length).greaterThanOrEquals(1);
  })

  const contacts = data.contacts || [];
  each(contacts, validateContacts);

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
  each(tags, (tag, index) => {
    test(`tags[${index}]`, 'tag is required', () => { enforce(tag).isNotEmpty() }, index + 'required');
    test(`tags[${index}]`, 'tag needs to be unique', () => { enforce(tag).condition((tag: string) => tags.filter(t => t === tag).length === 1) }, index + 'unique' + tag);
  });

})();

function validateContacts(contact: SampleDataContactDetail, i: number) {
  test(`contacts[${i}].type`,
    'Type is required',
    () => { enforce(contact.type); },
    `contacts[${i}].type-required`
  );
  test(`contacts[${i}].type`,
    `Type "${contact.type}" is an unknown type`,
    () => { enforce(contact.type).isValueOf(SampleDataContactDetailType); },
    `contacts[${i}].type-unknown${contact.type}`
  );
  test(`contacts[${i}].value`,
    () => {
      enforce(contact.value)
        .message(`${contact.type} can not be blank`)
        .isNotBlank()
      switch (contact.type) {
        case SampleDataContactDetailType.Email:
          enforce(contact.value)
            .message('not an valid email address')
            .matches(/^[^@]+@[^@]+$/);
          break;
        case SampleDataContactDetailType.Fax:
        case SampleDataContactDetailType.Mobile:
        case SampleDataContactDetailType.Phone:
          const allowedChars = '0123456789-()+ '.split('');
          enforce(contact.value)
            .message('Phone number can only contain numbers, spaces, dashes, brackets and plus signs')
            .condition((value: string) => value.split('').every(c => allowedChars.includes(c)))
          enforce(contact.value)
            .message('Phone number must contain at least 9 numbers')
            .condition((value: string) => value.split('').filter(c => '0123456789'.includes(c)).length >= 9);
          break;
      }
    },
    `contacts[${i}].value-${contact.value}`
  );
};


function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}

export const entropy = (str:string) => {
  return [...new Set([...str])]
    .map((chr) => {
      return str.match(new RegExp(chr, 'g'))?.length || 0;
    })
    .reduce((sum, frequency) => {
      let p = frequency / str.length;
      return sum + p * Math.log2(1 / p);
    }, 0);
};
