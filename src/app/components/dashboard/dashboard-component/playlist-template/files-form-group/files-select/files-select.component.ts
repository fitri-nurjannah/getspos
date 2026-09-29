import { Component, OnInit, OnDestroy, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { takeUntil } from 'rxjs/operators';
import { ItemSelectService } from '@root/src/app/components/shared/shared-file-storage/item-select/item-select.service';
import { SharedFileStorageComponent } from '@root/src/app/components/shared/shared-file-storage/shared-file-storage-component/shared-file-storage.component';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckCircleOutline, matRemoveCircleOutlineOutline } from '@ng-icons/material-icons/outline';
import { lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'template-files-select',
  templateUrl: './files-select.component.html',
  styleUrls: ['./files-select.component.css'],
  imports: [
      NgIcon,
      SharedFileStorageComponent
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  viewProviders: [provideIcons({ matCheckCircleOutline, matRemoveCircleOutlineOutline, lucideX })]
})
export class FilesSelectComponent implements OnInit, OnDestroy {
  @ViewChild(SharedFileStorageComponent, { static: true })
  sharedFileStorageComponent: SharedFileStorageComponent;

  isInFileSelectModal: boolean;

  selectedItems: any[];

  forCoverImage: boolean;
  coverImageName: string;
  sliderTypes: 'pptx' | 'mix';

  private _takeUntil: Subject<void> = new Subject();

  constructor(
    private readonly _itemSelectService: ItemSelectService,
    public dialogRef: DialogRef<boolean>, 
    @Inject(DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this._itemSelectService.initSelectedItems([]);

    this.selectedItems = [];
    this.initVariables();
    
    if (this.selectedItems && this.selectedItems.length > 0) {
      this._itemSelectService.initSelectedItems([...this.selectedItems]);
    }

    this.subscribeToSelectedItems();
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  initVariables(): void {
    this.forCoverImage = this.data.forCoverImage;
    this.coverImageName = this.data.coverImageName;
    this.sliderTypes = this.data.sliderTypes;
    if (!this.forCoverImage) {
      this.selectedItems = this.data.selectedItemsArray;
    }
  }

  saveSelection(): void {
    this.dialogRef.close(true);
  }

  unSelectAll(): void {
    this.sharedFileStorageComponent.unselectAllSelectableItems();
  }

  selectAll(): void {
    this.sharedFileStorageComponent.selectAllSelectableItems();
  }

  private subscribeToSelectedItems(): void {
    this._itemSelectService.selectedItems$
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_selectedItems) => {
        this.selectedItems = _selectedItems;
      });
  }
}
