import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomTickerBarComponent } from './bottom-ticker-bar.component';

describe('BottomTickerBarComponent', () => {
  let component: BottomTickerBarComponent;
  let fixture: ComponentFixture<BottomTickerBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomTickerBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomTickerBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
