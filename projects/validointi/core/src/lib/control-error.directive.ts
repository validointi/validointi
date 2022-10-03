import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  NgControl,
  NgModel,
} from '@angular/forms';
import {
  asyncScheduler,
  distinctUntilChanged,
  observeOn,
  Subject,
  takeUntil,
} from 'rxjs';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngModel]:not(no-error)',
  standalone: true,
})
export class ControlErrorDirective implements OnInit, OnDestroy {
  #destroy = new Subject<void>();
  #lastStatus = '';
  #cdr = inject(ChangeDetectorRef);
  #control = (
    inject(ControlContainer, { optional: true, self: true }) ||
    inject(NgControl, { optional: true, self: true })
  )?.control as AbstractControl;
  #elm = inject(ElementRef).nativeElement! as HTMLInputElement;
  #model = inject(NgModel);

  ngOnInit() {
    this.#model.statusChanges
      ?.pipe(
        observeOn(asyncScheduler),
        distinctUntilChanged(),
        takeUntil(this.#destroy)
      )
      .subscribe(() => this.changes());
  }

  ngOnDestroy(): void {
    this.#destroy.next();
  }

  private changes() {
    const errors = this.#control?.errors || this.#model.control?.errors;
    if (errors) {
      const [firstKey] = Object.keys(errors);
      this.#elm.setCustomValidity(errors[firstKey]);
      this.#elm.title = errors[firstKey];
    } else {
      this.#elm.setCustomValidity('');
      this.#elm.title = '';
    }
    if (this.#control.status !== this.#lastStatus) {
      this.#model.control.markAllAsTouched();
      this.#model.control.markAsDirty();
      this.#cdr.detectChanges();
      this.#lastStatus = this.#control.status;
    }
  }
}
