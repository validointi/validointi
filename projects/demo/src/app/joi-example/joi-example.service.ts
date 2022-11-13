import { inject, Injectable } from '@angular/core';
import { ValidatorRegistryService, createJoiAdapter } from '@validointi/core';
import * as Joi from 'joi';
import { of } from 'rxjs';

const schema = Joi.object().keys({
  id: Joi.required(),
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  confirm: Joi.ref('password'),
});

@Injectable({ providedIn: 'root' })
export class JoiExampleService {
  /** injections */
  #vr = inject(ValidatorRegistryService);

  validate = this.#vr.registerValidator('joi-data', createJoiAdapter(schema));

  save = async (data: Partial<any>) => {
    const validationResult = await this.validate(data);
    if (!isEmpty(validationResult)) {
      console.dir(validationResult);
      throw new Error(`can't save invalid data`);
    }
  };

  getData() {
    return of(
      structuredClone({
        id: '1',
        name: 'Sander',
        password: '1234',
        confirm: '1234',
      })
    );
  }
}

function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}
