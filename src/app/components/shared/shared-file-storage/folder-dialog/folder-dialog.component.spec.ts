import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolderDialogComponent } from './folder-dialog.component';
import { provideNgIconsConfig } from '@ng-icons/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FolderDialogComponent', () => {
  let component: FolderDialogComponent;
  let fixture: ComponentFixture<FolderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderDialogComponent],
      providers: [
        provideNgIconsConfig({}),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: { close: () => {} } },
        { provide: DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FolderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});