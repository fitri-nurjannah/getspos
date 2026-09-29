/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, QueryList, ViewChildren, Input, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { animations } from '@root/src/app/animations';
import { GenericService } from '@root/src/app/services/generic.service';
import { AuthenticationService } from '@root/src/app/services/authentication.service';

import { Folder, SliderFile } from '@root/src/app/interfaces/interfaces';

import { MatMenuTrigger, MatMenu, MatMenuContent, MatMenuItem } from '@angular/material/menu';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MoveToComponent } from '../move-to/move-to.component';

import { ItemSelectDirective } from '../item-select/item-select.directive';
import { FileStorageService } from '../file-storage.service';
import { FileStorageHelpers } from '../file-storage.helpers';

import { UserLimitsInfo } from '../../user-limits-table/user-limits-info.types';
import { BreadcrumbMenuComponent } from '../breadcrumb-menu/breadcrumb-menu.component';
import { ItemSelectService } from '../item-select/item-select.service';
import { ItemSelectComponent } from '../item-select/item-select.component';

import { NgClass, NgStyle } from '@angular/common';
import { CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPreview } from '@angular/cdk/drag-drop';
import { UserLimitsTableComponent } from '../../user-limits-table/user-limits-table.component';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroFolder, heroTrash, heroFolderPlus, heroPhoto, heroVideoCamera, heroDocumentText, heroInformationCircle, heroDocument, heroPlay, heroPresentationChartBar, heroMapPin, heroMusicalNote, heroPencilSquare, heroPlus, heroArrowsRightLeft, heroCursorArrowRays } from '@ng-icons/heroicons/outline';
import { heroHomeSolid, heroCheckSolid } from '@ng-icons/heroicons/solid';
import { matCheckBoxOutline, matCheckBoxOutlineBlankOutline, matIndeterminateCheckBoxOutline } from '@ng-icons/material-icons/outline';
import { lucideUpload } from '@ng-icons/lucide';
import { Dialog } from '@angular/cdk/dialog';
import { FolderDialogComponent } from '../folder-dialog/folder-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { FileThumbnailPipe } from '@root/src/app/pipes/file-thumbnail.pipe';
import { FileIconPipe } from '@root/src/app/pipes/file-icon.pipe';

@Component({
    selector: 'app-shared-files-storage',
    templateUrl: './shared-file-storage.component.html',
    styleUrls: ['./shared-file-storage.component.css'],
    animations: [animations],
    imports: [
        CdkDropListGroup, CdkDropList, UserLimitsTableComponent, NgIcon, BreadcrumbMenuComponent, NgClass, ItemSelectComponent, CdkDrag, ItemSelectDirective, NgStyle, CdkDragPreview, MatMenuTrigger, MatMenu, MatMenuContent, MatMenuItem, FormsModule, ReactiveFormsModule, MoveToComponent, FileThumbnailPipe, FileIconPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ matCheckBoxOutlineBlankOutline, heroTrash, matCheckBoxOutline, heroCheckSolid, matIndeterminateCheckBoxOutline, heroHomeSolid, heroFolder, heroFolderPlus, lucideUpload, heroPhoto, heroVideoCamera, heroDocumentText, heroInformationCircle, heroDocument, heroPlay, heroPresentationChartBar, heroMapPin, heroMusicalNote, heroPencilSquare, heroPlus, heroArrowsRightLeft, heroCursorArrowRays })]
})
export class SharedFileStorageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @ViewChild(MoveToComponent) moveToComponent: MoveToComponent;
  @ViewChild(BreadcrumbMenuComponent) breadcrumbComponent: BreadcrumbMenuComponent;
  @ViewChild('contextMenuContainer') contextMenuContainerElement: ElementRef<HTMLDivElement>;
  @ViewChildren(ItemSelectDirective) selecteItemDirectives: QueryList<ItemSelectDirective>;
  @ViewChild(ItemSelectComponent) itemSelect!: ItemSelectComponent;
  @Input() isInSelectModal: boolean;
  @Input() previouslySelectedItems: any[];
  @Input() forSelectingSliderCoverImage: boolean;
  @Input() disableDragAndMove: boolean;
  @Input() sliderTypes: 'pptx' | 'mix';
  @Input() allCheckedChange: any;
  @Input() partialCheckedChange: any;

  folderForm: FormGroup;

  arrayOfFiles: SliderFile[];
  arrayOfFolders: Folder[];

  dataFromDb: {
    files: SliderFile[];
    folders: Folder[];
  } = { files: [], folders: [] };
  userLimitInfos: UserLimitsInfo;

  contextMenuPosition = { x: '0px', y: '0px' };
  rightClickedElem;
  rightClickEvent;

  isAdmin: boolean;
  isMaster: boolean;

  contextMenuFor: 'file' | 'folder' | 'none';
  selectedFolderId = 0;
  isCreating;
  currentParentFolderId = 0;

  isDragStarted = false;
  isDraggingFolder: boolean = null;
  isDraggingOverFolder = false;
  mouseHoverItem: HTMLDivElement = null;
  draggedContentId = 0;
  idOfFolderUnderDraggedItem = 0;

  selectedItems: any[] = [];
  _takeUntil: Subject<void> = new Subject();

  allChecked = false;
  allCheckedFile = false;
  partialChecked: boolean;
  partialCheckedFile: boolean;

  isDropdownActive: boolean = false;
  partialCheckedFolder: boolean;
  allCheckedFolder: boolean;

  allchecked = { text: 'Files and Folders' };
  allcheckedFile = { text: 'Files' };
  allcheckedFolder = { text: 'Folders' };

  constructor(
    private auth: AuthenticationService,
    private genericService: GenericService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _filesStorageService: FileStorageService,
    private readonly _fb: FormBuilder,
    private readonly _snackBar: MatSnackBar,
    private readonly _itemSelectService: ItemSelectService,
    public dialog: Dialog
  ) {
    this.isMaster = this.auth.isMaster();
    const userDetails = this.auth.getUserDetails();
    this.isAdmin = userDetails ? userDetails.isAdmin : false;
  }

  ngOnInit(): void {
    this.folderForm = this._fb.group({
      name: ['', Validators.required],
    });
    this.getFilesAndFolders();
    this.getSelectedItems();
    this._itemSelectService.setIsInFileSelectVar(this.isInSelectModal);
  }

  ngOnDestroy(): void {
    if (!this.isInSelectModal) {
      this.unselectAllSelectableItems();
    }
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  ngAfterViewInit(): void {
    if(this.selecteItemDirectives?.length > 0){
      this.afterViewChecked();
    }else{
      this.selecteItemDirectives.changes.subscribe(children => {
        this.afterViewChecked();
      });
    }
  }

  private afterViewChecked(): void {
    if (this.isInSelectModal && this.previouslySelectedItems?.length > 0) {
      this.partialChecked = this.partiallyComplete();
      this.previouslySelectedItems.forEach((_psi) => {
        this.selecteItemDirectives.forEach((_sid) => {
          const isFile = FileStorageHelpers.checkIfFile(_sid.appItemSelect);
          if (isFile && _psi.id == _sid.appItemSelect.id) {
            _sid.selected = true;
          }
        });
      });
    }
  }

  // Add this helper function to open the delete dialog
  openDeleteConfirmation() {
    const containsFolder = this.selectedItems.some(item => !FileStorageHelpers.checkIfFile(item));
    
    const dialogRef = this.dialog.open<boolean>(ConfirmDeleteDialogComponent, {
      data: { 
        count: this.selectedItems.length, 
        containsFolder: containsFolder 
      },
    });

    dialogRef.closed.subscribe(result => {
      if (result === true) {
        this.deleteItems();
      }
    });
  }
  
  deleteItems(): void {
    this._filesStorageService.deleteItems(this.selectedItems).subscribe(
      () => {
        this.openSnackBar('Deleted', false);
      },
      () => {
        this.openSnackBar('Failed', true);
      }
    );
    this.allCheckedFile = false;
    this.partialCheckedFile = false;
    
  }

  openUploadFileModal(): void {
    this.genericService.displayUploadFileModal(
      true,
      `folder/${
        this.currentParentFolderId == 0 ? null : this.currentParentFolderId
      }/create-file`,
      this.userLimitInfos
    );

    // subscribes to the subscriber for only first time
    this.genericService.fileUploadModalStatusSubject
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_status) => {
        if (_status == 'completed') {
          this._filesStorageService.initDataFromServer();
        }
      });
  }

  onContextMenu(
    _event,
    _contextMenuFor,
    _fileOrFolder?: any,
    _moveToPanelTargetElem?,
    _selectableItemElem?: ItemSelectDirective
  ): boolean {    
    // To prevent browser's default contextmenu
    _event.preventDefault();
    _event.stopPropagation();
    this.moveToComponent.closePopover();

    if (!this.isMaster) {
      return false;
    }

    const containerPosition =
    this.contextMenuContainerElement.nativeElement.getBoundingClientRect();
    this.contextMenuPosition.x = _event.clientX - containerPosition.x + 'px';
    this.contextMenuPosition.y = _event.clientY - containerPosition.y + 'px';

    this.contextMenuFor = _contextMenuFor;

    this.contextMenu.openMenu();
    this.rightClickedElem = _moveToPanelTargetElem;
    this.rightClickEvent = _event;

    if (this.contextMenuFor != 'none') {
      this.checkItemAlreadySelected(_fileOrFolder, _selectableItemElem);
    }

    this._changeDetectorRef.detectChanges();

    return false;
  }

  unselectAllSelectableItems(): void {
    this._itemSelectService.initSelectedItems([]);
    this.selecteItemDirectives.forEach((_sid) => {
      _sid.selected = false;
    });
  }

  selectAllSelectableItems(): void {
    let selectedItems = this.selectedItems;
    this.selecteItemDirectives.forEach((_sid) => {
      if(FileStorageHelpers.checkIfFile(_sid.appItemSelect)){
        _sid.selected = true;
        const inSelectedItems = selectedItems.find(item => item.id === _sid.appItemSelect.id);
        if(!inSelectedItems) selectedItems.push(_sid.appItemSelect);
      }
    });
    // updating selected items
    this._itemSelectService.initSelectedItems(selectedItems);
  }

  // gets files from server
  private getFilesAndFolders(): void {
    this._filesStorageService.getFiles
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_files: SliderFile[]) => {
        this.dataFromDb.files = _files;
        this.filterFilesOrFolders(
          'files',
          _files,
          [],
          this.currentParentFolderId
        );
        // if in file select modal and we have previously selected items
        if (this.isInSelectModal && this.previouslySelectedItems?.length > 0) {
          this.initSelectedItemsIfPreviouslySelectedItems();
        }
      });
    this._filesStorageService.getFolders
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_folders: Folder[]) => {
        this.dataFromDb.folders = _folders;
        this.filterFilesOrFolders(
          'folders',
          [],
          _folders,
          this.currentParentFolderId
        );
      });
  }

  private initSelectedItemsIfPreviouslySelectedItems(): void {
    this._itemSelectService.initSelectedItems(this.previouslySelectedItems);
    this.partialChecked = this.partiallyComplete();
  }
  private getSelectedItems(): void {
    if (!(this.isInSelectModal && this.previouslySelectedItems?.length > 0)) {
      this._itemSelectService.initSelectedItems([]);
    }
    this._itemSelectService.selectedItems$
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_items) => {
        this.selectedItems = _items;
    });
    this.partialCheckedFile = this.partiallyCompleteFile();
    this.partialChecked = this.partiallyComplete();
  }

  onContextMenuClose(): void {}

  // 1. Update the Dialog Trigger
  openFolderDialog(isCreating: boolean) {
    let currentName = '';
    
    // If renaming, find the folder being edited
    if (!isCreating) {
      const selectedFolder = this.selectedItems[0];
      if (selectedFolder) {
        currentName = selectedFolder.name;
        this.selectedFolderId = selectedFolder.id;
      }
    }

    const dialogRef = this.dialog.open<string>(FolderDialogComponent, {
      data: { name: currentName, isCreating: isCreating },
    });

    dialogRef.closed.subscribe(newName => {
      if (newName && newName.trim() !== '') {
        if (isCreating) {
          this.createFolder(newName);
        } else {
          this.renameFolder(newName);
        }
      }
    });
  }

  // 2. Update Create to accept name parameter
  createFolder(name: string): void {
    const parentFolderId = this.currentParentFolderId == 0 ? null : this.currentParentFolderId;
    this._filesStorageService
      .createFolder(name, parentFolderId)
      .subscribe(
        () => {
          this.openSnackBar('Folder Created', false);
          this._filesStorageService.initDataFromServer(); // Refresh data
        },
        () => this.openSnackBar('Failed to create folder', true)
      );
  }

  // 3. Update Rename to accept name parameter
  renameFolder(name: string): void {
    this._filesStorageService
      .renameFolder(
        name,
        this.selectedFolderId,
        this.currentParentFolderId == 0 ? null : this.currentParentFolderId
      )
      .subscribe(
        () => {
          this.openSnackBar('Folder Renamed', false);
          this._filesStorageService.initDataFromServer(); // Refresh data
        },
        () => this.openSnackBar('Failed to rename folder', true)
      );
  }

  initFolderForm(_isCreating: boolean): void {
    // in this function, there will be only one selecteItem which will be the folder
    let folder: any = { name: '' };
    if (!_isCreating) {
      folder = this.selectedItems[0];
      this.selectedFolderId = folder.id;
    }
    this.folderForm.reset(folder);
    this.isCreating = _isCreating;
  }

  folderDblClick(_parentFolderId: number): void {
    if(!this.isInSelectModal) this.resetCheckboxes();
    this.currentParentFolderId = _parentFolderId == 0 ? null : _parentFolderId;
    this.filterFilesOrFolders(
      'both',
      this.dataFromDb.files,
      this.dataFromDb.folders,
      this.currentParentFolderId
    );
    setTimeout(() => {
      this.breadcrumbComponent.update();

      // if in select modal, have to select items selected before
      if (this.isInSelectModal) {
        this.selectItemsSelectedBeforeOpeningFolder();
      }
    }, 1);
  }

  moveTo(): void {
    this.moveToComponent.open(this.rightClickEvent, this.rightClickedElem);
  }

  onItemClick(
    _item: any,
    _itemElemRef: ItemSelectDirective,
    _event: MouseEvent
  ): void {
    if (_event.ctrlKey || this.isInSelectModal) {
      if (_event.ctrlKey || (this.isInSelectModal && FileStorageHelpers.checkIfFile(_item))) {
        if (_itemElemRef.selected) {
          this._itemSelectService.removeSelectedItem(_item);
        } else {
          // if we are selecting the image for slider cover image, we will select only one.
          if (this.forSelectingSliderCoverImage) {
            this.unselectAllSelectableItems();
          }
          this._itemSelectService.addSelectedItem(_item);
        }
        _itemElemRef.selected = !_itemElemRef.selected;
      }
    } else {
      this.selecteItemDirectives.forEach((_si) => {
        _si.selected = false;
      });
      // updating selected items
      this._itemSelectService.initSelectedItems([_itemElemRef.appItemSelect]);
      // update display selected item
      _itemElemRef.selected = true;
    }
    this.partialCheckedFolder = this.partiallyCompleteFolder();
    this.partialCheckedFile = this.partiallyCompleteFile();
    this.partialChecked = this.partiallyComplete();
  }

  moveSelectedItems(): void {
    this._filesStorageService
      .moveSelectedItems(this.selectedItems, this.idOfFolderUnderDraggedItem)
      .subscribe(
        () => {
          this.openSnackBar('Moved', false);
        },
        () => {
          this.openSnackBar('Failed', true);
        }
      );
  }

  moveToResultEmitterCatch(_isSuccessful: boolean): void {
    if (_isSuccessful) {
      this.openSnackBar('Items Moved', false);
    } else {
      this.openSnackBar('Failed', true);
    }
  }

  // emitter calls it from bread crumb component
  breadcrumbMenuChanged(_parentFolderId): void {
    if(!this.isInSelectModal) this.resetCheckboxes();
    this.currentParentFolderId = _parentFolderId;

    this.filterFilesOrFolders(
      'both',
      this.dataFromDb.files,
      this.dataFromDb.folders,
      _parentFolderId
    );

    setTimeout(() => {
      this.selectItemsSelectedBeforeOpeningFolder();
    }, 1);
  }

  private filterFilesOrFolders(
    _filterType: 'files' | 'folders' | 'both',
    _files: SliderFile[],
    _folders: Folder[],
    _parentFolderId: number
  ): void {
    const parentFolderId = _parentFolderId == 0 ? null : _parentFolderId;

    if (_filterType == 'files') {
      this.filterFiles(_files, parentFolderId);
    } else if (_filterType == 'folders') {
      this.filterFolders(_folders, parentFolderId);
    } else if (_filterType == 'both') {
      this.filterFiles(_files, parentFolderId);
      this.filterFolders(_folders, parentFolderId);
    }
  }

  private filterFiles(_files: SliderFile[], _parentFolderId: number): void {
    this.arrayOfFiles = _files.filter((_f) => {
      const isInFolder = _f.folderId == _parentFolderId;
  
      if (this.forSelectingSliderCoverImage) {
        return isInFolder && _f.type?.includes('image');
      }
      return isInFolder;
    });
  }

  private filterFolders(_folders: Folder[], _parentFolderId: number): void {
    this.arrayOfFolders = _folders.filter(
      (_f) => _f.parentFolderId == _parentFolderId
    );
  }

  private checkItemAlreadySelected(
    _fileOrFolder,
    _selectableItemElem: ItemSelectDirective
  ): void {
    if (!_selectableItemElem.selected) {
      this.selecteItemDirectives.forEach((_si) => (_si.selected = false));
      this._itemSelectService.initSelectedItems([_fileOrFolder]);
      _selectableItemElem.selected = true;
      this.partialChecked = this.partiallyComplete();
    }
  }

  private selectItemsSelectedBeforeOpeningFolder(): void {
    this.selectedItems.forEach((_si) => {
      this.selecteItemDirectives.forEach((_sid) => {
        const itemSelectDir = _sid.appItemSelect;
        if (_si.id == itemSelectDir.id) {
          if (
            FileStorageHelpers.checkIfFile(_si) &&
            FileStorageHelpers.checkIfFile(_sid.appItemSelect)
          ) {
            _sid.selected = true;
          }
        }
      });
    });
  }
  ///////////////////////////////
  ////// drag drop events ///////
  ///////////////////////////////

  dragStarted(
    _fileOrFolder: Folder | SliderFile,
    _selectableItem: ItemSelectDirective
  ): void {
    this.isDragStarted = true;
    this.idOfFolderUnderDraggedItem = null;

    if (!_selectableItem.selected) {
      this.selecteItemDirectives.forEach((_si) => (_si.selected = false));
      _selectableItem.selected = true;
      this._itemSelectService.initSelectedItems([_fileOrFolder]);
      // this.selectedItems = [_fileOrFolder];
    }
    this.partialChecked = this.partiallyComplete();
  }

  drop(_droppedContent: 'folder' | 'file'): void {
    if (this.idOfFolderUnderDraggedItem) {
      this.moveSelectedItems();
    }

    this.isDragStarted = false;

    if (this.mouseHoverItem) {
      this.mouseHoverItem.parentElement.className =
        this.mouseHoverItem.parentElement.className.replace(
          'drag-placeholder',
          ''
        );
    }
    this.mouseHoverItem = null;
  }

  mouseEnter(
    _idOfFolderUnderDraggedItem: number,
    _elem: HTMLDivElement,
    _isFolderSelected: boolean
  ): void {
    if (this.isDragStarted) {
      if (
        (_idOfFolderUnderDraggedItem == this.draggedContentId &&
          this.isDraggingFolder) ||
        _isFolderSelected
      ) {
        return;
      }

      this.mouseHoverItem = _elem;
      this.idOfFolderUnderDraggedItem = _idOfFolderUnderDraggedItem;
      if (this.mouseHoverItem) {
        this.mouseHoverItem.parentElement.className =
          this.mouseHoverItem.parentElement.className += ' drag-placeholder';
      }
    }
  }

  mouseOut(): void {
    if (this.isDragStarted) {
      if (this.mouseHoverItem) {
        this.mouseHoverItem.parentElement.className =
          this.mouseHoverItem.parentElement.className.replace(
            ' drag-placeholder',
            ''
          );
      }
      this.idOfFolderUnderDraggedItem = null;
    }
  }

  openSnackBar(message: string, isError: boolean): void {
    this._snackBar.open(message, '', {
      panelClass: isError ? 'snack-bar-custom-error' : 'snack-bar-custom',
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
  // Prevents mousedown event
  preventMouseDown(event: MouseEvent) {
    event.stopPropagation();
  }

  getAllChecked(value): void{
    this.allChecked = value;
  }

  getAllCheckedFile(value): void{
    this.allCheckedFile = value;
  }

  getAllCheckedFolder(value): void{
    this.allCheckedFolder = value;
  }

  getPartialChecked(value): void{
    this.partialChecked = value;
  }

  getPartialCheckedFile(value): void{
    this.partialCheckedFile = value;
  }

  getPartialCheckedFolder(value): void{
    this.partialCheckedFolder = value;
  }

  // Checkbox Functions

  partiallyComplete (): boolean {
    let partialChecked: boolean = false;
    if (this.selecteItemDirectives?.length > 0) {
      const totalItems = this.selecteItemDirectives.length;
      const selectedCount = this.selecteItemDirectives.filter(item => item.selected).length;
      if (selectedCount === totalItems) {
        this.allChecked = true;
        this.partialChecked = false;
        partialChecked = false;
      } else {
        this.allChecked = false;
        if(selectedCount !== 0){
          this.partialChecked = true;
          partialChecked = true;
        }
      }
    }
    return partialChecked;
  };

  partiallyCompleteFile (): boolean {
    let partialCheckedFile: boolean = false;
    if (this.selecteItemDirectives?.length > 0) {
      const itemDirectives = this.selecteItemDirectives.filter(item => item.appItemSelect.originalName);
      const totalItems = itemDirectives.length;
      const selectedCount = itemDirectives.filter(item => item.selected).length;
      if (selectedCount === totalItems) {
        this.allCheckedFile = true;
        this.partialCheckedFile = false;
        partialCheckedFile = false;
      } else {
        this.allCheckedFile = false;
        if(selectedCount !== 0){
          this.partialCheckedFile = true;
          partialCheckedFile = true;
        }
      }
    }
    return partialCheckedFile;
  };

  partiallyCompleteFolder (): boolean {
    let partialCheckedFolder: boolean = false;
    if (this.selecteItemDirectives?.length > 0) {
      const itemDirectives = this.selecteItemDirectives.filter(item => !item.appItemSelect.originalName);
      const totalItems = itemDirectives.length;
      const selectedCount = itemDirectives.filter(item => item.selected).length;
      if (selectedCount === totalItems) {
        this.allCheckedFolder = true;
        this.partialCheckedFolder = false;
        partialCheckedFolder = false;
      } else {
        this.allCheckedFolder = false;
        if(selectedCount !== 0){
          this.partialCheckedFolder = true;
          partialCheckedFolder = true;
        }
      }
    }
    return partialCheckedFolder;
  };

  updateCheckbox(checked: boolean) {
    let selectedItems = [];
    this.partialChecked = false;
    this.partialCheckedFile = false;
    this.partialCheckedFolder = false;
    this.selecteItemDirectives.forEach((_si) => {
      _si.selected = checked;
      if(checked) selectedItems.push(_si.appItemSelect);
    });
    if(checked){
      this.allChecked = true;
      this.allCheckedFile = true;
      this.allCheckedFolder = true;
    }else{
      this.allChecked = false;
      this.allCheckedFile = false;
      this.allCheckedFolder = false;
    }
    // updating selected items
    this._itemSelectService.initSelectedItems(selectedItems);
  }

  updateCheckboxFile(checked: boolean) {
    let selectedItems = [];
    this.partialCheckedFile = false;
    this.selecteItemDirectives.forEach((_si) => {
      const isFile = FileStorageHelpers.checkIfFile(_si.appItemSelect);
      if (isFile){
        _si.selected = checked;
        if(checked) selectedItems.push(_si.appItemSelect);
      }
    });
    if(checked){
      this.allCheckedFile = true;
      this.partialChecked = true;
      if(this.allCheckedFolder){
        this.allChecked = true;
        this.partialChecked = false;
      }
    }else{
      this.allChecked = false;
      this.allCheckedFile = false;
      this.partialChecked = false;
      if(this.allCheckedFolder) this.partialChecked = true;
    }
    // updating selected items
    this._itemSelectService.initSelectedItems(selectedItems);
  }

  updateCheckboxFolder(checked: boolean) {
    let selectedItems = [];
    this.partialCheckedFolder = false;
    this.selecteItemDirectives.forEach((_si) => {
      const isFile = FileStorageHelpers.checkIfFile(_si.appItemSelect);
      if (!isFile){
        _si.selected = checked;
        if(checked) selectedItems.push(_si.appItemSelect);
      }
    });
    if(checked){
      this.allCheckedFolder = true;
      this.partialChecked = true;
      if(this.allCheckedFile){
        this.allChecked = true;
        this.partialChecked = false;
      }
    }else{
      this.allChecked = false;
      this.allCheckedFolder = false;
      this.partialChecked = false;
      if(this.allCheckedFile) this.partialChecked = true;
    }
    // updating selected items
    this._itemSelectService.initSelectedItems(selectedItems);
  }

  resetCheckboxes() {
    this.allChecked = false;
    this.allCheckedFile = false;
    this.allCheckedFolder = false;
    this.partialChecked = false;
    this.partialCheckedFile = false;
    this.partialCheckedFolder = false;
  }

  toggleDropdown(state: boolean | null): void {
    if (state == null) state = !this.isDropdownActive;
    this.isDropdownActive = state;
  }

  closePopover(): void {
    this.moveToComponent.closePopover();
  }

  getFileIcon(file: any): string {
    if (file?.type?.includes('image')) return 'heroPhoto';
    if (file?.type?.includes('video')) return 'heroVideoCamera';
    if (file?.type === 'application/pdf') return 'heroDocumentText';
    if (file?.type?.includes('audio')) return 'heroMusicalNote';
    return 'heroDocument';
  }
}
