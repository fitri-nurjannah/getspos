import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningTextDialogComponent } from './running-text-dialog.component';

describe('RunningTextDialogComponent', () => {
  let component: RunningTextDialogComponent;
  let fixture: ComponentFixture<RunningTextDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunningTextDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunningTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
