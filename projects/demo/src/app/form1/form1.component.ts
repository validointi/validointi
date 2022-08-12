import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ValidatorDirective } from 'validator';
import { SampleData, SampleDataService } from '../sample-data.service';

@Component({
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule, ValidatorDirective, FormsModule],
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css']
})
export class Form1Component  {
  #sd = inject(SampleDataService);
  data$ = this.#sd.getById('1');

  submit(data:SampleData) {
    this.#sd.save(data);
  }
}
