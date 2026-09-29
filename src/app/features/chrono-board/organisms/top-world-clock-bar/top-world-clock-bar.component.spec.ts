import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopWorldClockBarComponent } from './top-world-clock-bar.component';

describe('TopWorldClockBarComponent', () => {
  let component: TopWorldClockBarComponent;
  let fixture: ComponentFixture<TopWorldClockBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopWorldClockBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopWorldClockBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
