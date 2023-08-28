import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { vldntiDirectives } from '@validointi/core';
import { entropy, SampleData, SampleDataService } from './sample-data.service';
import { ValidationErrorHookUpDirective } from './validationErrorHookUp.directive';

@Component({
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule, [vldntiDirectives], FormsModule, ValidationErrorHookUpDirective],
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css'],
})
export class Form1Component {
  #sds = inject(SampleDataService);
  data$ = this.#sds.getById('1');
  entropy = entropy;

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
}
