import { Component, inject, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ValidatorDirective } from './validator.directive';
import { ValidationErrors } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';

@Component({
  template: '<form validationId="testdata"></form>',
  standalone: true,
  imports: [ValidatorDirective, FormsModule],
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
