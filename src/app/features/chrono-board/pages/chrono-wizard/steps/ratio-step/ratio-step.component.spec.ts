import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatioStepComponent } from './ratio-step.component';

describe('RatioStepComponent', () => {
  let component: RatioStepComponent;
  let fixture: ComponentFixture<RatioStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatioStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatioStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
