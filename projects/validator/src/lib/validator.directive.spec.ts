import { Component, inject, OnInit } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ValidatorDirective } from './validator.directive';
import { ValidatorRegistryService } from './validatorsRegistry.service';

@Component({
  template: '<form validationId="testdata"></form>',
  standalone: true,
  imports: [ValidatorDirective, FormsModule],
})
export class SimpleComponent implements OnInit {
  service = inject(ValidatorRegistryService);
  ngOnInit() {
    async function validateSampleData(data: any): Promise<any> {
      const test = (data = {}) => {
        return [];
      };
    }
    let validate = this.service.registerValidator('testdata', validateSampleData);
  }
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
