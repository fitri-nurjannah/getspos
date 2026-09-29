import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutStepComponent } from './layout-step.component';

describe('LayoutStepComponent', () => {
  let component: LayoutStepComponent;
  let fixture: ComponentFixture<LayoutStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
