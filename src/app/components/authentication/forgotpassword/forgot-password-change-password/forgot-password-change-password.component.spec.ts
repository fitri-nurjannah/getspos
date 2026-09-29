import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ForgotPasswordChangePasswordComponent } from './forgot-password-change-password.component';

describe('ForgotPasswordChangePasswordComponent', () => {
  let component: ForgotPasswordChangePasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordChangePasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordChangePasswordComponent],
      providers: [
        // Add the router with a catch-all wildcard mock:
        provideRouter([{ path: '**', component: class {} }])
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});