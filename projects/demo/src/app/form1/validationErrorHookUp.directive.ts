import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { asyncScheduler, observeOn, tap } from 'rxjs';

@Directive({
  selector: '[ngModel]',
  standalone: true,
})
export class ValidationErrorHookUpDirective implements OnDestroy {
  #elm = inject(ElementRef).nativeElement! as HTMLInputElement;
  #model = inject(NgModel);

  #sub = this.#model.statusChanges
    ?.pipe(
      observeOn(asyncScheduler),
      tap(() => {
        const errors = this.#model.control.errors;
        if (errors) {
          Object.entries(errors).forEach(([key, value]) => {
            const errMsg = Array.isArray(value) ? value.join('\n') : value;
            this.#elm.setCustomValidity(errMsg);
            this.#elm.title = errMsg;
          });
        } else {
          this.#elm.setCustomValidity('');
          this.#elm.title = '';
        }
      })
    )
    .subscribe();

  ngOnDestroy(): void {
    if (this.#sub) {
      this.#sub.unsubscribe();
    }
  }
}
