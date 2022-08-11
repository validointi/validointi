import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorRegistryService } from 'validator';
import { ValidatorDirective } from 'projects/validator/src/lib/validator.directive';

@Component({
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule, ValidatorDirective],
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css']
})
export class Form1Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
