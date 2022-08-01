import { AfterViewInit, Directive, Input } from '@angular/core';
import {
  FormGroup,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Directive({
  selector: 'form[validateForm]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidatorDirective,
      multi: true,
    },
  ],
})
export class ValidatorDirective implements Validator, AfterViewInit {
  private _validateForm!: any;
  private _onChange?: () => void;

  @Input('validateForm')
  get validateForm() {
    return this._validateForm;
  }

  set validateForm(schema: any) {
    this._validateForm = schema;
    if (this._onChange) {
      this._onChange();
    }
  }
  validate(formGroups: FormGroup): ValidationErrors | null {
    Object.keys(formGroups.controls).forEach((key) => {
      console.error(key, formGroups.get(key)?.value);
    });
    return null;
  }
  registerOnValidatorChange?(fn: () => void): void {
    this._onChange = fn;
  }

  ngAfterViewInit(): void {}
}
