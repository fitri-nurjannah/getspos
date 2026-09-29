import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardLayoutComponent } from './wizard-layout.component';

describe('WizardLayoutComponent', () => {
  let component: WizardLayoutComponent;
  let fixture: ComponentFixture<WizardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
