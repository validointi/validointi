import { Directive, ElementRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[validationId]:not(no-error)',
  standalone: true,
})
export class FormErrorDirective {
  submit$: Observable<Event> = fromEvent(this.element, 'submit').pipe(
    tap(() => {
      if (this.element.classList.contains('form-submitted') === false) {
        this.element.classList.add('form-submitted');
      }
    }),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  reset$: Observable<Event> = fromEvent(this.element, 'reset').pipe(
    tap(() => {
      this.element.classList.remove('form-submitted');
    }),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  constructor(private host: ElementRef<HTMLFormElement>) {}

  get element() {
    return this.host.nativeElement;
  }
}
