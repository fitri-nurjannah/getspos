import { TestBed } from '@angular/core/testing';

import { FilePathService } from './file-path.service';

describe('FilePathService', () => {
  let service: FilePathService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilePathService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
