import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldClockItemComponent } from './world-clock-item.component';

describe('WorldClockItemComponent', () => {
  let component: WorldClockItemComponent;
  let fixture: ComponentFixture<WorldClockItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldClockItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldClockItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
