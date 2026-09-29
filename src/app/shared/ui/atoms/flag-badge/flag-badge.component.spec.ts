import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagBadgeComponent } from './flag-badge.component';

describe('FlagBadgeComponent', () => {
  let component: FlagBadgeComponent;
  let fixture: ComponentFixture<FlagBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
