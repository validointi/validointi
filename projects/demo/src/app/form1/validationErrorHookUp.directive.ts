import { ChangeDetectorRef, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { asyncScheduler, observeOn, tap } from 'rxjs';

@Directive({
  selector: '[ngModel]',
  standalone: true,
})
export class ValidationErrorHookUpDirective implements OnDestroy {
  #elm = inject(ElementRef).nativeElement! as HTMLInputElement;
  #cdr = inject(ChangeDetectorRef);
  #model = inject(NgModel);
  lastState ='';

  #sub = this.#model.statusChanges
    ?.pipe(
      observeOn(asyncScheduler),
      tap((status) => {
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
        /**
         * Make sure the ui is updated,
         * but only when there is an invalid state!
         * when the state is valid, the ui is updated by the form itself.
         */
        if (status !== this.lastState) {
          this.#model.control.markAllAsTouched();
          this.#model.control.markAsDirty();
          this.#cdr.detectChanges();
          this.lastState = status;
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
