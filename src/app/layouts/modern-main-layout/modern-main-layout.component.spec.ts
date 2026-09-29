import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModernMainLayoutComponent } from './modern-main-layout.component';

describe('ModernMainLayoutComponent', () => {
  let component: ModernMainLayoutComponent;
  let fixture: ComponentFixture<ModernMainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModernMainLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModernMainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
