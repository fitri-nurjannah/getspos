import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChronoWizardComponent } from './chrono-wizard.component';

describe('ChronoWizardComponent', () => {
  let component: ChronoWizardComponent;
  let fixture: ComponentFixture<ChronoWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChronoWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChronoWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
