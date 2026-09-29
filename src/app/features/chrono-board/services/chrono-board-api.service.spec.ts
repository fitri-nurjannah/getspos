import { TestBed } from '@angular/core/testing';

import { ChronoBoardApiService } from './chrono-board-api.service';

describe('ChronoBoardApiService', () => {
  let service: ChronoBoardApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChronoBoardApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
