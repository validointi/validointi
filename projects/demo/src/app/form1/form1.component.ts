import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorRegistryService } from 'validator';
import { ValidatorDirective } from 'projects/validator/src/lib/validator.directive';
import { FormsModule } from '@angular/forms';
import { SampleDataService } from '../sample-data.service';

@Component({
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule, ValidatorDirective, FormsModule],
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css']
})
export class Form1Component implements OnInit {
  #sd = inject(SampleDataService);
  data$ = this.#sd.getById('1');

  constructor() { }

  ngOnInit(): void {
  }

}
