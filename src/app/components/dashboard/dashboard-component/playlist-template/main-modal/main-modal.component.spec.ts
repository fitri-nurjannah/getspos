import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainModalComponent } from './main-modal.component';
import { provideNgIconsConfig } from '@ng-icons/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

describe('MainModalComponent', () => {
  let component: MainModalComponent;
  let fixture: ComponentFixture<MainModalComponent>;

  beforeEach(async () => {
    // Spy on prototype so ngOnInit never executes:
    vi.spyOn(MainModalComponent.prototype, 'ngOnInit').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [MainModalComponent],
      providers: [
        provideNgIconsConfig({}),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: { close: () => {} } },
        { provide: DIALOG_DATA, useValue: {} },
      ],
    })
    .overrideComponent(MainModalComponent, {
      set: {
        imports: [],
        template: '<div></div>'
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});