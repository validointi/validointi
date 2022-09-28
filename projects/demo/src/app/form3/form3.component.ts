import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ValidatorDirective } from '@validointi/core';
import { firstValueFrom } from 'rxjs';
import { SampleData, SampleDataService } from '../form1/sample-data.service';
import { ValidationErrorHookUpDirective } from '../form1/validationErrorHookUp.directive';
import { ContactsComponent } from './contacts/contacts.component';
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
    ContactsComponent
  ],
  templateUrl: './form3.component.html',
  styleUrls: ['./form3.component.css'],
})
export class Form3Component {
  #sds = inject(SampleDataService);
  data$ = this.#sds.getById('1');
  fieldValidation = true;

  submit(data: SampleData) {
    console.table(data)
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

  async force(data: SampleData, form: NgForm, ev: Event) {
    console.table(form.control.getRawValue());
    Object.entries(form.controls).forEach(([key, control]) => {
      // control.clearAsyncValidators();
      // control.clearValidators();
      // control.markAsTouched();
      // control.markAsDirty();
      control.updateValueAndValidity();
    });
    ev.preventDefault();
  }

  async clear(data: SampleData, form: NgForm, ev: Event) {
    clearObject(data);
    Object.entries(form.controls).forEach(([key, control]) => {
      control.clearAsyncValidators();
      control.clearValidators();
      control.markAsUntouched();
      control.updateValueAndValidity();
    });
    ev.preventDefault();
  }

  async reset(data: SampleData, form: NgForm) {
    this.data$ = this.#sds.getById('1');
  }
}
const clearObject = (obj: any) => {
  for (const key of Object.keys(obj)) {
    if (key === 'id') continue;
    if (Array.isArray(obj[key])) {
      obj[key].length=0; // throw away all the items
      obj[key] = []; // replace with a new reference to a new array
    } else if (obj[key] instanceof Object) {
      clearObject(obj[key]);
    } else {
      obj[key] = undefined;
    }
  }
};

const mergeObjects = (target: any = {}, source: any) => {
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      // merge(target[key] ??= [], source[key]);
      target[key] ??= [];
      source[key].forEach((item: any, index: number) => {
        if (item instanceof Object) {
          mergeObjects(target[key][index] ??= (Array.isArray(item) ? [] : {}), item);
        } else {
          target[key][index] = item;
        }
      })
    } else if (source[key] instanceof Object) {
      mergeObjects((target[key] ??= {}), source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};
