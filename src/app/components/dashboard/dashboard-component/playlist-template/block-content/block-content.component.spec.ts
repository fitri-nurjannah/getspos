import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockContentComponent } from './block-content.component';

describe('BlockContentComponent', () => {
  let component: BlockContentComponent;
  let fixture: ComponentFixture<BlockContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
