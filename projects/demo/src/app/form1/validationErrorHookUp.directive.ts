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
  lastState = '';

  #change = (status: string) => {
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
     * Make sure the ui is updated when the status changes
     */
    if (status !== this.lastState) {
      this.#model.control.markAllAsTouched();
      this.#model.control.markAsDirty();
      this.#cdr.detectChanges();
      this.lastState = status;
    }
  };

  #sub = this.#model.statusChanges?.pipe(tap(this.#change)).subscribe();

  ngOnDestroy(): void {
    this.#sub?.unsubscribe();
  }
}
