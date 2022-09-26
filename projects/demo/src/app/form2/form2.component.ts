import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ValidatorDirective } from '@validointi/core';
import { map } from 'rxjs/operators';
import { ValidationErrorHookUpDirective } from '../form1/validationErrorHookUp.directive';
import { SampleDataForm2Service, StarwarsDTO, SampleData } from './sample-data-form2.service';
@Component({
  selector: 'app-form2',
  standalone: true,
  imports: [
    CommonModule,
    ValidatorDirective,
    FormsModule,
    HttpClientModule,
    ValidationErrorHookUpDirective,
  ],
  templateUrl: './form2.component.html',
  styleUrls: ['./form2.component.css'],
})
export class Form2Component {
  #httpClient = inject(HttpClient);
  #sds = inject(SampleDataForm2Service);

  data$ = this.#sds.getById('1');
  starwars$ = this.#httpClient
    .get<StarwarsDTO>(`https://swapi.dev/api/people`)
    .pipe(
      map((response) => response.results),
      map((results) =>
        results.map((person, index) => ({ id: index, name: person.name }))
      )
    );

  submit(data: Partial<SampleData>) {
    this.#sds
      .save2(data)
      .catch((e) => {
        console.error(
          'this should be impossible, as the form is validated, but anyway, there is an error while saving the data!',
          e
        );
      })
      .then(() => console.info('Yes!'));
  }
}
