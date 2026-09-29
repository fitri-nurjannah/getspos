import { TestBed } from '@angular/core/testing';
import { FileIconPipe } from './file-icon.pipe';

describe('FileIconPipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({});
    const pipe = TestBed.runInInjectionContext(() => new FileIconPipe());
    expect(pipe).toBeTruthy();
  });
});