import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutCardOptionComponent } from './layout-card-option.component';

describe('LayoutCardOptionComponent', () => {
  let component: LayoutCardOptionComponent;
  let fixture: ComponentFixture<LayoutCardOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutCardOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutCardOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
