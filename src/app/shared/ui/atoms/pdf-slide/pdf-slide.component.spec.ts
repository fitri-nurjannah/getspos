import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfSlideComponent } from './pdf-slide.component';

describe('PdfSlideComponent', () => {
  let component: PdfSlideComponent;
  let fixture: ComponentFixture<PdfSlideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfSlideComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfSlideComponent);
    component = fixture.componentInstance;
    // Set required signal inputs BEFORE detectChanges():
    fixture.componentRef.setInput('src', 'sample.pdf');
    fixture.componentRef.setInput('page', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});