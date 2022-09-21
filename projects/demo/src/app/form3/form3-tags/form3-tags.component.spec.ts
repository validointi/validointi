import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Form3TagsComponent } from './form3-tags.component';

describe('Form3TagsComponent', () => {
  let component: Form3TagsComponent;
  let fixture: ComponentFixture<Form3TagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ Form3TagsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Form3TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
