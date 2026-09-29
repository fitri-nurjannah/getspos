/* eslint-disable @typescript-eslint/prefer-for-of */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SliderFile, Folder } from '@root/src/app/interfaces/interfaces';
import { FileStorageHelpers } from '../file-storage.helpers';
import { FileStorageService } from '../file-storage.service';
import { ItemSelectService } from '../item-select/item-select.service';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroArrowLeft, heroCheck, heroFolder, heroChevronRight, heroPhoto, heroMapPin, heroPlay, heroFilm, heroDocumentText, heroFolderPlus, heroInbox} from '@ng-icons/heroicons/outline';
import { FileIconPipe } from '@root/src/app/pipes/file-icon.pipe';

@Component({
    selector: 'app-move-to',
    templateUrl: './move-to.component.html',
    styleUrls: ['./move-to.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet, FormsModule, NgClass, NgIconComponent, FileIconPipe,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [
      provideIcons({
        heroXMark, heroArrowLeft, heroCheck, heroFolder, heroChevronRight, heroPhoto, heroMapPin, heroPlay, heroFilm, heroDocumentText, heroFolderPlus, heroInbox
      }),
    ]
})
export class MoveToComponent implements OnInit, OnDestroy {
  @Input('parentFolderId')
  comingParentFolderId: number;

  @Output()
  moveToResultEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  // @Input()
  selectedItems: any[];

  parentFolderId: number | null = null;
  parentFolderName: string = 'Root';
  isCreatingFolder: boolean = false;
  clickedFolderId: number | null;
  newFolderName = 'unnamed folder';
  showBackButton = true;

  currentFiles: SliderFile[] = [];
  currentFolders: Folder[] = [];
  dataFromServer = {
    files: [],
    folders: [],
  };
  isContentAlreadyHere = true;
  isSubmitting = false;
  _takeUntil: Subject<void> = new Subject();
  isOpen: boolean = false;
  
  constructor(
    private _fileStorageService: FileStorageService,
    private _itemSelectService: ItemSelectService
  ) {}

  ngOnInit(): void {
    this._fileStorageService.getFiles
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_files) => {
        this.dataFromServer.files = _files;
      });

    this._fileStorageService.getFolders
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_folders) => {
        this.dataFromServer.folders = _folders;
      });

    this._itemSelectService.selectedItems$
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_items) => {
        this.selectedItems = _items;
      });
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  isFolderInSelectedItems(_folder): boolean {
    return this.selectedItems.find((_si) =>
      !FileStorageHelpers.checkIfFile(_si) ? _folder.id == _si.id : false
    );
  }
  
  open($event?: any, _target?: any): void {
    this.isCreatingFolder = false;
    this.isSubmitting = false;
    this.initSettings();
    this.isOpen = true;
  }

  closePopover(): void {
    this.isOpen = false;
  }

  goBackFolder(): void {
    if (this.isCreatingFolder) {
      this.isCreatingFolder = false;
      return;
    }

    const parentFolder = this.dataFromServer.folders.find(
      (_f) => _f.id == this.parentFolderId
    );

    this.updateParentFolderIdNameAndInitData(parentFolder.parentFolderId);
  }

  createNewFolder(): void {
    this.clickedFolderId = null;
    this.newFolderName = 'unnamed folder';
    this.isCreatingFolder = true;

    const folderNameInputElem = document.getElementById(
      'newFolderInputField'
    ) as HTMLInputElement;

    setTimeout(() => {
      if (folderNameInputElem) {
        folderNameInputElem.select();
      }
    }, 100);
  }

  goToFolder(_parentFolderId: number): void {
    this.updateParentFolderIdNameAndInitData(_parentFolderId);
    this.clickedFolderId = null;
  }

  update(): void {
    const parentFolderId = this.clickedFolderId
      ? this.clickedFolderId
      : this.parentFolderId;

    this.isSubmitting = true;
    this._fileStorageService
      .moveSelectedItems(this.selectedItems, parentFolderId)
      .subscribe(
        () => {
          this.isOpen = false;
          this.isSubmitting = false;
          this.moveToResultEmitter.next(true);
        },
        () => {
          this.isSubmitting = false;
          this.moveToResultEmitter.next(false);
        }
      );
  }

  folderClicked(_newParentFolderId: number): void {
    this.clickedFolderId = _newParentFolderId;
    this.initIsContentAlreadyHere();
  }

  createFolderInDb(): void {
    this._fileStorageService
      .createFolder(this.newFolderName, this.parentFolderId)
      .subscribe((_createdFolder: Folder) => {
        this.isCreatingFolder = false;
        this.updateParentFolderIdNameAndInitData(_createdFolder.id);
      });
  }

  private updateParentFolderIdNameAndInitData(_parentFolderId: number): void {
    this.parentFolderId = _parentFolderId == 0 ? null : _parentFolderId;
    this.parentFolderName =
      this.parentFolderId == null
        ? 'Home'
        : this.dataFromServer.folders.find((_f) => _f.id == this.parentFolderId)
            .name;
    this.initCurrentData();
  }

  private initSettings(): void {
    this.updateParentFolderIdNameAndInitData(this.comingParentFolderId);
    this.clickedFolderId = null;
  }

  private initCurrentData(): void {
    this.currentFiles = this.dataFromServer?.files?.filter(
      (_f) => _f.folderId == this.parentFolderId
    );
    this.currentFolders = this.dataFromServer?.folders?.filter(
      (_f) => _f.parentFolderId == this.parentFolderId
    );

    this.initIsContentAlreadyHere();
  }

  private initIsContentAlreadyHere(): void {
    let contentParentId;
    let isFolderInSelectedItems = false;

    if (this.selectedItems.length > 0) {
      // first will be a file or folder
      contentParentId = this.selectedItems[0].parentFolderId
        ? this.selectedItems[0].parentFolderId
        : this.selectedItems[0].folderId;

      // if clicked folder is coming in selected items
      isFolderInSelectedItems = !!this.selectedItems.find(
        (_si) => _si.id == this.clickedFolderId
      );
    } else {
      contentParentId = null;
    }
    this.isContentAlreadyHere = this.clickedFolderId
      ? contentParentId == this.clickedFolderId || isFolderInSelectedItems
      : contentParentId == this.parentFolderId;
  }

  // private openSnackBar(message: string): void {
  //   this._snackBar.open(message, '', {
  //     panelClass: 'snack-bar-custom',
  //     duration: 2000,
  //     horizontalPosition: 'center',
  //     verticalPosition: 'top',
  //   });
  // }
}
