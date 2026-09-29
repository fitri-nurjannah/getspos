import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatioSelectorComponent } from './ratio-selector.component';

describe('RatioSelectorComponent', () => {
  let component: RatioSelectorComponent;
  let fixture: ComponentFixture<RatioSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatioSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatioSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
