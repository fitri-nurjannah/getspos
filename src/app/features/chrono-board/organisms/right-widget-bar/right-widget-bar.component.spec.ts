import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightWidgetBarComponent } from './right-widget-bar.component';

describe('RightWidgetBarComponent', () => {
  let component: RightWidgetBarComponent;
  let fixture: ComponentFixture<RightWidgetBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightWidgetBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightWidgetBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
