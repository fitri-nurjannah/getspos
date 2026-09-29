import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistStatusComponent } from './playlist-status.component';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PlaylistStatusComponent', () => {
  let component: PlaylistStatusComponent;
  let fixture: ComponentFixture<PlaylistStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistStatusComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: class {} }]),
        provideAnimationsAsync(),
      ],
    })
    .overrideComponent(PlaylistStatusComponent, {
      set: { template: '<div></div>' }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});