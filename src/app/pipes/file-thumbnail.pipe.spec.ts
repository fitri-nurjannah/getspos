import { TestBed } from '@angular/core/testing';
import { FileThumbnailPipe } from './file-thumbnail.pipe';

describe('FileThumbnailPipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({});
    const pipe = TestBed.runInInjectionContext(() => new FileThumbnailPipe());
    expect(pipe).toBeTruthy();
  });
});