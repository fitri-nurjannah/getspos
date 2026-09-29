import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningTextItemComponent } from './running-text-item.component';

describe('RunningTextItemComponent', () => {
  let component: RunningTextItemComponent;
  let fixture: ComponentFixture<RunningTextItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunningTextItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunningTextItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
