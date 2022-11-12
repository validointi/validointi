import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ValidatorDirective } from '@validointi/core';
import { JoiExampleService } from './joi-example.service';

@Component({
  selector: 'app-joi-example',
  standalone: true,
  imports: [
    CommonModule,
    ValidatorDirective,
    FormsModule,
    // ValidationErrorHookUpDirective,
  ],
  templateUrl: './joi-example.component.html',
  styleUrls: ['./joi-example.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoiExampleComponent {
  #sds = inject(JoiExampleService);
  data$ = this.#sds.getData();

  submit(data: any) {
    this.#sds.save(data);
  }
}
