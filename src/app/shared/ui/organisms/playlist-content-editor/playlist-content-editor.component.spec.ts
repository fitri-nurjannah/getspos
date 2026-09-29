import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistContentEditorComponent } from './playlist-content-editor.component';

describe('PlaylistContentEditorComponent', () => {
  let component: PlaylistContentEditorComponent;
  let fixture: ComponentFixture<PlaylistContentEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistContentEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistContentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
