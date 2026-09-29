import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChronoEditorComponent } from './chrono-editor.component';

describe('ChronoEditorComponent', () => {
  let component: ChronoEditorComponent;
  let fixture: ComponentFixture<ChronoEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChronoEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChronoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
