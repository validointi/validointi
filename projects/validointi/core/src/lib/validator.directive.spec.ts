import { Component, inject, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// import { VldntiControlDirective } from './vldnti-control.directive';
// import { ValidatorDirective } from './validator.directive';
import { ValidationErrors } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';
import exp from 'constants';

@Component({
  template: '<form validationId="testdata"></form>',
  standalone: true,
  imports: [FormsModule],
})
export class SimpleComponent {
  service = inject(ValidatorRegistryService);
  validate = this.service.registerValidator('testdata', async () => {
    return {} as ValidationErrors;
  });
}

describe('ValidatorDirective', () => {
  let fixture;
  let comp: SimpleComponent;
  beforeEach(async () => {
    fixture = TestBed.configureTestingModule({
      imports: [SimpleComponent],
    }).createComponent(SimpleComponent);
    fixture.detectChanges();
    comp = fixture.debugElement.componentInstance;
  });

  it('should create an instance', () => {
    expect(comp).toBeDefined();
  });
});
