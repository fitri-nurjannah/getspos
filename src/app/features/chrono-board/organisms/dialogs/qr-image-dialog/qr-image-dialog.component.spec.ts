import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrImageDialogComponent } from './qr-image-dialog.component';

describe('QrImageDialogComponent', () => {
  let component: QrImageDialogComponent;
  let fixture: ComponentFixture<QrImageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrImageDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
