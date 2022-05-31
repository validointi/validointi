import { Directive } from '@angular/core';
import { create } from 'vest';


@Directive({
  selector: '[validate]',
  standalone: true
})
export class ValidatorDirective {

  constructor() {
    const suite = create((data = {}, fieldname) => {
      // ...
    });
    suite({}, '').isValid()
  }

}
