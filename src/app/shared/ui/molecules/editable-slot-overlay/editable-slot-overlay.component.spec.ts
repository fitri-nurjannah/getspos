import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableSlotOverlayComponent } from './editable-slot-overlay.component';

describe('EditableSlotOverlayComponent', () => {
  let component: EditableSlotOverlayComponent;
  let fixture: ComponentFixture<EditableSlotOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableSlotOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableSlotOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
