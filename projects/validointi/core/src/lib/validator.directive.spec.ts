import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { ValidationErrors } from './validator.types';
import { ValidatorRegistryService } from './validatorsRegistry.service';

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
      providers: [provideZonelessChangeDetection()],
      imports: [SimpleComponent],
    }).createComponent(SimpleComponent);
    fixture.detectChanges();
    comp = fixture.debugElement.componentInstance;
  });

  it('should create an instance', () => {
    expect(comp).toBeDefined();
  });
});
