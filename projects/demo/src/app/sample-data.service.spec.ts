import { TestBed } from '@angular/core/testing';

import { SampleDataService } from './sample-data.service';

describe('SampleDataService', () => {
  let service: SampleDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SampleDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
