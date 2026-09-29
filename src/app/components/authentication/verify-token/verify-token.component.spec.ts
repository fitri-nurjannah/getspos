import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyTokenComponent } from './verify-token.component';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';

describe('VerifyTokenComponent', () => {
  let component: VerifyTokenComponent;
  let fixture: ComponentFixture<VerifyTokenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [VerifyTokenComponent],
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([{ path: '**', component: class {} }]),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
