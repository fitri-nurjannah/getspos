import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistTemplateComponent } from './playlist-template.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { provideNgIconsConfig } from '@ng-icons/core';

describe('PlaylistTemplateComponent', () => {
  let component: PlaylistTemplateComponent;
  let fixture: ComponentFixture<PlaylistTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistTemplateComponent],
      providers: [
        provideNgIconsConfig({}),
        { provide: DialogRef, useValue: { close: () => {} } },
        { provide: DIALOG_DATA, useValue: {} },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
