import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ValidationErrors } from '@angular/forms';
import { ValidatorRegistryService } from './validatorsRegistry.service';
import { VldntiControlDirective } from './vldnti-control.directive';

@Component({
  template: `<form validationId="testdata">
    <input type="text" name="test" [(ngModel)]='test' />
  </form>`,
  standalone: true,
  imports: [FormsModule],
})
export class SimpleComponent {
  test = "world";
  service = inject(ValidatorRegistryService);
  validate = this.service.registerValidator('testdata', async () => {
    return {} as ValidationErrors;
  });
}



describe('VldntiControlDirective', () => {
  let fixture;
  let comp: SimpleComponent;
  beforeEach(async () => {
    fixture = TestBed.configureTestingModule({
      imports: [SimpleComponent],
    }).createComponent(SimpleComponent);
    fixture.detectChanges();
    comp = fixture.debugElement.componentInstance;
  });

  it('should create an instance', () => {q
    expect(comp).toBeTruthy();
  });
});
