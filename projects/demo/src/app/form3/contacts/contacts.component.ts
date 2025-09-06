import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlContainer, FormsModule, NgModelGroup } from '@angular/forms';
import { SampleDataContactDetail, SampleDataContactDetailType } from '../../form1/sample-data.service';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactComponent, FormsModule],
  template: `
    @for (contact of contacts(); track contact; let i = $index) {
    <app-contact [contact]="contact" (delete)="delete(contact)" ngModelGroup="{{ '' + i }}"></app-contact>
    }
    <button class="action" (click)="add($event)" title="Add contact point">➕</button>
  `,
  styleUrls: ['./contacts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /** use DI to hook up the controls to the form, This is due to a bug in NG */
  viewProviders: [{ provide: ControlContainer, useExisting: NgModelGroup }],
})
export class ContactsComponent {
  readonly contacts = input.required<SampleDataContactDetail[]>();

  delete(contact: SampleDataContactDetail) {
    this.contacts().splice(this.contacts().indexOf(contact), 1);
  }

  add(ev: Event) {
    this.contacts().push({
      type: SampleDataContactDetailType.Email,
      value: ' ',
      priority: 0,
    });
    ev.preventDefault();
  }
}
