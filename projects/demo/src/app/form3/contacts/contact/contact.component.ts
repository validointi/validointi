import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, Output, ViewChildren } from '@angular/core';
import { ControlContainer, FormGroup, FormsModule, NgForm, NgModel } from '@angular/forms';
import { SampleDataContactDetail, SampleDataContactDetailType } from '../../../form1/sample-data.service';
import { ValidationErrorHookUpDirective } from '../../../form1/validationErrorHookUp.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ValidationErrorHookUpDirective],
  template: `
    <button (click)="delete.emit()">🗑️</button>
    <select [(ngModel)]="contact.type" name='type'>
      <option *ngFor="let type of types" [value]="type">{{ type}}</option>
      <option value="Sneaky!">Sneaky!</option>
    </select>
    <input type="text" [(ngModel)]="contact.value" name="value" />
    <input type="number" [(ngModel)]="contact.priority" name='priority'>
  `,
  styleUrls: ['./contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: ControlContainer, useFactory: (form:NgForm) => form, deps: [NgForm] }],
})
export class ContactComponent implements OnDestroy {
  @Input() contact!: SampleDataContactDetail;
  @Input() rowNum = 0;
  @Output() delete = new EventEmitter<void>();
  @ViewChildren(NgModel, { emitDistinctChangesOnly: false }) models!: NgModel[];

  form = inject(NgForm)
  types = Object.values(SampleDataContactDetailType);

  name = (field:string) => `contacts[${this.rowNum}].${field}`;

  ngAfterViewInit() {
    /** I need to add the formFields to the form, and follow the validation engine name-spec */
    this.models.forEach(model => {
      /** This could have been done in the template, but this is my lazy solution. */
      model.name = `contacts[${this.rowNum}].${model.name}`;
      // this.form.addControl(model);
    });
  }

  ngOnDestroy(): void {
    // this.models.forEach(model => {
    //   this.form.removeControl(model);
    // });
  }

}
