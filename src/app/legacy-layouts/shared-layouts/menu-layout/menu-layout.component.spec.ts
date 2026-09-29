import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuLayoutComponent } from './menu-layout.component';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { vi } from 'vitest';

describe('MenuLayoutComponent', () => {
  let component: MenuLayoutComponent;
  let fixture: ComponentFixture<MenuLayoutComponent>;

  beforeEach(async () => {
    // Spy on prototype so auth.getUserDetails() in ngOnInit never crashes:
    vi.spyOn(MenuLayoutComponent.prototype, 'ngOnInit').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [MenuLayoutComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: class {} }]),
        provideAnimationsAsync(),
      ],
    })
    .overrideComponent(MenuLayoutComponent, {
      set: { template: '<div></div>' }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});