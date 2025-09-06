import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ValidatorDirective, VldntiControlDirective } from '@validointi/core';
import { SampleData, SampleDataService } from '../form1/sample-data.service';
import { ValidationErrorHookUpDirective } from '../form1/validationErrorHookUp.directive';
import { clearObject } from './clearObject';
import { ContactsComponent } from './contacts/contacts.component';
import { Form3TagsComponent } from './form3-tags/form3-tags.component';

@Component({
  selector: 'app-form3',
  standalone: true,
  imports: [
    CommonModule,
    ValidatorDirective,
    VldntiControlDirective,
    FormsModule,
    ValidationErrorHookUpDirective,
    Form3TagsComponent,
    ContactsComponent,
  ],
  templateUrl: './form3.component.html',
  styleUrls: ['./form3.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Form3Component {
  #sds = inject(SampleDataService);
  data$ = this.#sds.getById('1');
  fieldValidation = true;

  submit(data: SampleData) {
    console.table(data);
    this.#sds
      .save(data)
      .catch((e): void => {})
      .then(() => console.info('Yes!'));
  }

  async inspect(data: SampleData, form: NgForm, ev: Event) {
    Object.entries(form.controls).forEach(([key, control]) => {
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
