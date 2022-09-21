import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ValidatorDirective } from '@se-ng/validate';
import { firstValueFrom } from 'rxjs';
import { SampleData, SampleDataService } from '../form1/sample-data.service';
import { ValidationErrorHookUpDirective } from '../form1/validationErrorHookUp.directive';
import { Form3TagsComponent } from './form3-tags/form3-tags.component';

@Component({
  selector: 'app-form3',
  standalone: true,
  imports: [
    CommonModule,
    ValidatorDirective,
    FormsModule,
    ValidationErrorHookUpDirective,
    Form3TagsComponent,
  ],
  templateUrl: './form3.component.html',
  styleUrls: ['./form3.component.css'],
})
export class Form3Component {
  #sds = inject(SampleDataService);
  data$ = this.#sds.getById('1');

  submit(data: SampleData) {
    this.#sds
      .save(data)
      .catch((e): void => {
        console.error(
          'this should be impossible, as the form is validated, but anyway, there is an error while saving the data!',
          e
        );
      })
      .then(() => console.info('Yes!'));
  }

  async clear(data: SampleData, form: NgForm, ev: Event) {
    // clearObject(data);
    const rawData = form.control.getRawValue();
    console.table(rawData);
    form.control.clearAsyncValidators();
    form.control.clearValidators();
    form.control.markAllAsTouched();
    ev.preventDefault();
  }

  async reset(data: SampleData, form: NgForm) {
    const original = await firstValueFrom(this.#sds.getById('1'));
    data.tags.length = 0;
    merge(data, original);
    form.control.clearAsyncValidators();
    form.control.clearValidators();
    form.control.markAllAsTouched();
  }
}

const clearObject = (obj: any) => {
  for (const key of Object.keys(obj)) {
    if (key === 'id') continue;
    if (Array.isArray(obj[key])) {
      obj[key].length = 0;
    } else if (obj[key] instanceof Object) {
      clearObject(obj[key]);
    } else {
      obj[key] = undefined;
    }
  }
};

const merge = (target: any = {}, source: any) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      merge((target[key] ??= {}), source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};
