import { Component, EventEmitter, inject, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dialog, DialogModule, DIALOG_DATA } from '@angular/cdk/dialog';
import { take } from 'rxjs/operators';
import { FileStorageHelpers } from '@root/src/app/components/shared/shared-file-storage/file-storage.helpers';
import { ItemSelectService } from '@root/src/app/components/shared/shared-file-storage/item-select/item-select.service';
import { SliderFile } from '@root/src/app/interfaces/interfaces';
import { FilesSelectComponent } from './files-select/files-select.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DragableItemsListComponent } from './dragable-items-list/dragable-items-list.component';

import { DomSecurePipe } from '@root/src/app/pipes/domSecurePipe';

import { CdkStepperPrevious } from '@angular/cdk/stepper';
import { lucideCircleHelp } from '@ng-icons/lucide';

@Component({
    selector: 'app-files-fg',
    templateUrl: './files-form-group.component.html',
    styleUrls: ['./files-form-group.component.css'],
    providers: [],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgIcon,
        DragableItemsListComponent,
        CdkStepperPrevious,
        DomSecurePipe,
        DialogModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ lucideCircleHelp })]
})
export class FilesFormGroupComponent implements OnInit {
  @Input() userLimitInfos;
  @Input() modalFor: 'create' | 'edit';
  @Input() sliderTypes: 'pptx' | 'mix';
  @Input() contentFormGroup!: FormGroup;
  
  @Input() selectedPlaylist: any;

  @Input() currentContent: number = 0;

  @Output() navigateToStep = new EventEmitter<number>();

  selectedItems: SliderFile[] = [];
  previouslySelectedItems: SliderFile[] = [];
  coverImageName: string = '';

  private dialog = inject(Dialog);

  constructor(
    private readonly _itemSelectService: ItemSelectService,
    private readonly _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.init();
  }

  // --- HELPER: Get the specific block data based on index ---
  get dataContext(): any {
    if (this.selectedPlaylist && 
        Array.isArray(this.selectedPlaylist.playlistblocks) && 
        this.selectedPlaylist.playlistblocks[this.currentContent]) {
      return this.selectedPlaylist.playlistblocks[this.currentContent];
    }
    return null;
  }

  public init(): void {
    // 1. Ensure Form Controls Exist
    // If the parent hasn't added these controls yet, we add them here to prevent errors
    if (!this.contentFormGroup.get('selectedItems')) {
      this.contentFormGroup.addControl('selectedItems', new FormControl([], Validators.required));
    }
    if (!this.contentFormGroup.get('coverImageName')) {
      this.contentFormGroup.addControl('coverImageName', new FormControl(''));
    }

    // 2. Populate Data
    if (this.modalFor == 'edit') {
      const data = this.dataContext;
      
      if (data) {
        // Copy files array to avoid reference issues
        this.selectedItems = data.files ? data.files.slice() : [];
        this.coverImageName = data.coverImageName || '';
      } else {
        // Fallback if data for this specific index doesn't exist yet (e.g. added new slide in edit mode)
        this.selectedItems = [];
        this.coverImageName = '';
      }

      this.editFormValues();
    } else {
      this.selectedItems = [];
      this.coverImageName = '';
    }
  }
  
  showSelectFilesModal(_forCoverImage: boolean, _sliderTypes: 'pptx' | 'mix', selectedItemsChange?): void {
    if(selectedItemsChange) this.selectedItems = selectedItemsChange;
    
    this.previouslySelectedItems = this.selectedItems.slice();
    
    const dialogRef = this.dialog.open(FilesSelectComponent, {
      data: {
        selectedItemsArray: this.selectedItems,
        forCoverImage: _forCoverImage,
        coverImageName: this.coverImageName,
        sliderTypes: _sliderTypes,
      },
      disableClose: false,
      hasBackdrop: false
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this._itemSelectService.selectedItems$
          .pipe(take(1))
          .subscribe((_items) => {
            _items = _items.filter((_i) => FileStorageHelpers.checkIfFile(_i)); // filtering folders
            
            if (_forCoverImage) {
              this.coverImageName = _items?.length > 0 ? _items[0].nameInDisk : '';
              this.contentFormGroup.get('coverImageName')?.patchValue(this.coverImageName);
            } else {
              this.selectedItems = _items;
              this.contentFormGroup.get('selectedItems')?.patchValue(_items);
            }
          });
      } else {
        this.selectedItems = this.previouslySelectedItems.slice();
      }
    });
  
  }

  removeCoverImage(): void {
    this.coverImageName = '';
    this.contentFormGroup.get('coverImageName')?.patchValue(this.coverImageName);
  }

  selectedItemsChange(_selectedItems: SliderFile[]): void {
    this.selectedItems = _selectedItems;
    // Ensure form control is updated when drag-and-drop reordering happens
    this.contentFormGroup.get('selectedItems')?.patchValue(this.selectedItems);
  }

  private editFormValues(): void {
    this.contentFormGroup.patchValue({
      coverImageName: this.coverImageName ? this.coverImageName : '',
      selectedItems: this.selectedItems,
    });
  }

  public resetForm(): void {
    this.selectedItems = [];
    this.coverImageName = '';
    this.contentFormGroup?.reset();
  }

  goToStep(step: number): void {
    this.navigateToStep.emit(step);
  }
}