import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlContainer, FormsModule, NgModelGroup } from '@angular/forms';
import { VldntiControlDirective } from '@validointi/core';
import { SampleDataContactDetail, SampleDataContactDetailType } from '../../../form1/sample-data.service';
import { ValidationErrorHookUpDirective } from '../../../form1/validationErrorHookUp.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ValidationErrorHookUpDirective, VldntiControlDirective],
  template: `
    <button (click)="delete.emit()">🗑️</button>
    <select [(ngModel)]="contact.type" name="type">
      <option *ngFor="let type of types" [value]="type">{{ type }}</option>
      <option value="Sneaky!">Sneaky!</option>
    </select>
    <input type="text" [(ngModel)]="contact.value" name="value" />
    <input type="number" [(ngModel)]="contact.priority" name="priority" />
  `,
  styleUrls: ['./contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /** use DI to hook up the controls to the model-group, This is due to a bug in NG */
  viewProviders: [{ provide: ControlContainer, useExisting: NgModelGroup }],
})
export class ContactComponent {
  @Input() contact!: SampleDataContactDetail;
  @Output() delete = new EventEmitter<void>();

  types = Object.values(SampleDataContactDetailType);
}
