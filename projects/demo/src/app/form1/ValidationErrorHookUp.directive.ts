import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { tap } from 'rxjs';


@Directive({
  selector: '[ngModel]',
  standalone: true,
})
export class ValidationErrorHookUpDirective implements OnDestroy {
  #elm = inject(ElementRef).nativeElement! as HTMLInputElement;
  #model = inject(NgModel);

  #sub = this.#model.statusChanges?.pipe(
    tap(status => {
      const errors = this.#model.control.errors;
      if (errors) {
        Object.entries(errors).forEach(([key, value]) => {
          // this.elm.setAttribute('error', key);
          const errMsg = Array.isArray(value) ? value.join('/n') : value;
          this.#elm.setCustomValidity(errMsg);
          this.#elm.title = errMsg;
          console.log({ key, value });
        });
      } else {
        this.#elm.setCustomValidity('');
        this.#elm.title = '';
      }
    })
  ).subscribe();

  ngOnDestroy(): void {
    if (this.#sub) { this.#sub.unsubscribe(); }
  }

}
