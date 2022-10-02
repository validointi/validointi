import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, inject, Input } from '@angular/core';
import { ControlContainer, FormControl, FormsModule, NgForm, NgModel } from '@angular/forms';
import { tap } from 'rxjs';
import { SampleDataContactDetail, SampleDataContactDetailType } from '../../form1/sample-data.service';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ContactComponent, FormsModule],
  template: `
    <app-contact *ngFor="let contact of contacts; let i=index" [contact]="contact" (delete)="delete(contact)" ngModelGroup="{{'contacts.'+i}}"></app-contact>
    <button (click)="add($event)"  title="Add contact point">➕</button>
  `,
  styleUrls: ['./contacts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /** use DI to hook up the controls to the form, This is due to a bug in NG */
  viewProviders: [{ provide: ControlContainer, useFactory: (form: NgForm) => form, deps: [NgForm] }],

})
export class ContactsComponent {
  @Input() contacts!: SampleDataContactDetail[];


  delete(contact: SampleDataContactDetail) {
    this.contacts.splice(this.contacts.indexOf(contact), 1);
  }

  add(ev: Event) {
    this.contacts.push({
      type: SampleDataContactDetailType.Email,
      value: ' ',
      priority: 0
    });
    ev.preventDefault();
  }

}
