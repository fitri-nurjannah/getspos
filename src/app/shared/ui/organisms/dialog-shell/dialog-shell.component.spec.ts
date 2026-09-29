import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShellComponent } from './dialog-shell.component';

describe('DialogShellComponent', () => {
  let component: DialogShellComponent;
  let fixture: ComponentFixture<DialogShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
