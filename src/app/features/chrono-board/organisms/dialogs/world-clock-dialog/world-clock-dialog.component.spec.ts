import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldClockDialogComponent } from './world-clock-dialog.component';

describe('WorldClockDialogComponent', () => {
  let component: WorldClockDialogComponent;
  let fixture: ComponentFixture<WorldClockDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldClockDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldClockDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
