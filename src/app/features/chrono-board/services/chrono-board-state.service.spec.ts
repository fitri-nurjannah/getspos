import { TestBed } from '@angular/core/testing';

import { ChronoBoardStateService } from './chrono-board-state.service';

describe('ChronoBoardStateService', () => {
  let service: ChronoBoardStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChronoBoardStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
