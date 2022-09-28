import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleDataContactDetail, SampleDataContactDetailType } from '../../form1/sample-data.service';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ContactComponent],
  template: `
    <app-contact *ngFor="let contact of contacts; let i=index" [contact]="contact" (delete)="delete(contact)" [rowNum]="i"></app-contact>
    <button (click)="add($event)" title="Add contact point">➕</button>
  `,
  styleUrls: ['./contacts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsComponent {
  @Input() contacts!: SampleDataContactDetail[];

  delete(contact: SampleDataContactDetail) {
    this.contacts.splice(this.contacts.indexOf(contact), 1);
  }

  add(ev:Event) {
    this.contacts.push({
      type: SampleDataContactDetailType.Email,
      value: '',
      priority: 0
    });
    console.table(this.contacts);
    ev.preventDefault();
  }
}
