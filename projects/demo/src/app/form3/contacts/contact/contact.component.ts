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
  /** use DI to hook up the controls to the form, This is due to a bug in NG */
  viewProviders: [{ provide: ControlContainer, useFactory: (form: NgForm) => form, deps: [NgForm] }],
})
export class ContactComponent {
  @Input() contact!: SampleDataContactDetail;
  @Input() rowNum = 0;
  @Output() delete = new EventEmitter<void>();

  types = Object.values(SampleDataContactDetailType);

  name = (field: string) => `contacts[${this.rowNum}].${field}`;

  @ViewChildren(NgModel, { emitDistinctChangesOnly: false }) models!: NgModel[];
  ngAfterViewInit() {
    this.models.forEach(model => {
      /** This could have been done in the template, but this is my lazy solution. */
      model.name = `contacts[${this.rowNum}].${model.name}`;
    });
  }

}
