import { TestBed } from '@angular/core/testing';

import { DendriticControllerService } from './dendritic-controller.service';

describe('DendriticControllerService', () => {
  let service: DendriticControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DendriticControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
