import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidatorDirective } from 'validator';
import { create, test } from 'vest';
import promisify from 'vest/promisify';

export interface StarwarsDTO {
  count: number;
  next: string;
  previous: any;
  results: Result[];
}

export interface Result {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

@Component({
  selector: 'app-form2',
  standalone: true,
  imports: [CommonModule, ValidatorDirective, FormsModule, HttpClientModule],
  templateUrl: './form2.component.html',
  styleUrls: ['./form2.component.css'],
})
export class Form2Component {
  #httpClient = inject(HttpClient);
  model = { starwars: '' };
  starwars$ = this.#httpClient
    .get<StarwarsDTO>(`https://swapi.dev/api/people`)
    .pipe(
      map((response) => response.results),
      map((results) =>
        results.map((person, index) => ({ id: index, name: person.name }))
      )
    );

  // validate: Luke Skywalker
  async checkValue(item: any) {
    const results = await lastValueFrom(
      this.#httpClient.get<StarwarsDTO>(`https://swapi.dev/api/people`).pipe(
        map((response) => response.results),
        map((persons) =>
          persons.map((person, index) => ({ id: index, name: person.name }))
        )
      )
    );
    const hasError = (
      results.filter((person) => person.name === item).length === 0
    ).toString();
    if (hasError) {
      throw new Error('Figure is not on the list');
    }
    return Promise.resolve(hasError);
  }
  suite = promisify(
    create((data = {}) => {
      test('id', 'id is required', () => this.checkValue(data.starwars));
    })
  );

  async clickIt() {
    const result = await this.suite(this.model);
    const errors = result.getErrors();
    console.error(errors);
  }
}
