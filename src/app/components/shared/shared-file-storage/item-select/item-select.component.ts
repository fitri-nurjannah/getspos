/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  ContentChildren,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ChangeDetectionStrategy
} from '@angular/core';
import { ItemSelectDirective } from './item-select.directive';
import * as itemSelectByDragHelpers from './item-select.helpers';
import * as _ from 'lodash';
import { FileStorageHelpers } from '../file-storage.helpers';
import { Subject } from 'rxjs';
import { ItemSelectService } from './item-select.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-item-select',
    templateUrl: './item-select.component.html',
    styleUrls: ['./item-select.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class ItemSelectComponent implements OnInit, OnDestroy {
  allChecked: boolean;
  @Output() allCheckedChange = new EventEmitter<boolean>();
  partialChecked: boolean;
  @Output() partialCheckedChange = new EventEmitter<boolean>();

  allCheckedFile: boolean;
  @Output() allCheckedFileChange = new EventEmitter<boolean>();
  partialCheckedFile: boolean;
  @Output() partialCheckedFileChange = new EventEmitter<boolean>();
  allCheckedFolder: boolean;
  @Output() allCheckedFolderChange = new EventEmitter<boolean>();
  partialCheckedFolder: boolean;
  @Output() partialCheckedFolderChange= new EventEmitter<boolean>();

  @Output() mouseDown = new EventEmitter<boolean>();

  @HostListener('mousedown', ['$event'])
  handleMouseDown($event: MouseEvent): void {
    this.mouseDown.emit(true); // close popover in parents if any
    if (!this._itemSelectService.getIsInFileSelectVar()) {
      this.startMouseX = $event.clientX;
      this.startMouseY = $event.clientY;

      this.createDivBoxElement();

      if ($event.ctrlKey) {
        this.tempSelectedItems = _.cloneDeep(
          this.$selectableItems.toArray().map((_si) => {
            _si.appItemSelect.selected = _si.selected;
            return _si.appItemSelect;
          })
        );
      }

      this.isDragging = true;
      this.mouseMovePixelCounts = 0;
      // if not in file select component, then
      if (!this._itemSelectService.getIsInFileSelectVar()) {
        this.update($event);
      }
    }
  }
  @HostListener('document:mousemove', ['$event'])
  handleMouseMove($event: MouseEvent): void {
    if (this.isDragging) {
      this.mouseMovePixelCounts++;
      if (this.mouseMovePixelCounts % 3 == 0) {
        this.update($event);
      }
    }
  }
  @HostListener('document:mouseup')
  handleMouseUp(): void {
    this.isDragging = false;
    this.mouseMovePixelCounts = 0;

    if (this.dragBoxElement) {
      this.dragBoxElement.remove();
    }
  }

  // @Output()
  // selectedItemsChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  @ContentChildren(ItemSelectDirective, { descendants: true })
  $selectableItems: QueryList<ItemSelectDirective>;

  // @Input()
  selectedItems: any[];

  dragBoxElement: HTMLDivElement;
  mouseMovePixelCounts = 0;
  tempSelectedItems: any[];

  isDragging = false;

  startMouseX = 0;
  startMouseY = 0;

  _takeUntil: Subject<void> = new Subject();

  constructor(private readonly _itemSelectService: ItemSelectService) {}

  ngOnInit(): void {
    this._itemSelectService.selectedItems$
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_items) => {
        this.selectedItems = _items;
      });
  }

  ngOnDestroy(): void {
    if (this.dragBoxElement) {
      this.dragBoxElement.remove();
    }

    this._takeUntil.next();
    this._takeUntil.complete();
  }

  private createDivBoxElement(): void {
    if (this.dragBoxElement) {
      // this.dragBoxElement.remove();
    }
    const divBox = document.createElement('div');
    divBox.style.position = 'fixed';
    divBox.style.backgroundColor = 'rgba(0, 0, 0, 0.233)';
    divBox.style.border = '2px solid rgba(0, 0, 0, 0.295)';
    divBox.style.zIndex = '99999';
    document.body.appendChild(divBox);
    this.dragBoxElement = divBox;
  }

  private updateDivBoxElement(_selectBoxStyles): void {
    if (this.dragBoxElement) {
      this.dragBoxElement.style.top = _selectBoxStyles.top;
      this.dragBoxElement.style.left = _selectBoxStyles.left;
      this.dragBoxElement.style.height = _selectBoxStyles.height;
      this.dragBoxElement.style.width = _selectBoxStyles.width;
    }
  }

  private update(_event: MouseEvent): void {
    // current mouse point
    const point = itemSelectByDragHelpers.getMousePosition(_event);
    const selectBoxStyles = itemSelectByDragHelpers.updateSelectCoverDiv(
      point,
      this.startMouseX,
      this.startMouseY
    );
    this.updateDivBoxElement(selectBoxStyles);
    this.updateSelectedItems(_event.ctrlKey);
  }

  private updateSelectedItems(_isCtrlPressed: boolean): void {
    const selectedItems: any[] = [];

    this.$selectableItems.forEach((_si) => {
      const position = _si.getBoundries();

      const isInDraggedDiv = itemSelectByDragHelpers.boxIntersects(
        position,
        this.dragBoxElement.getBoundingClientRect()
      );

      // if ctrl is pressed
      if (_isCtrlPressed) {
        const tempItem = this.getTempSelectableItem(_si);

        _si.selected = isInDraggedDiv ? !tempItem.selected : tempItem.selected;
      } else {
        _si.selected = isInDraggedDiv;
      }

      if (_si.selected) {
        selectedItems.push(_si.appItemSelect);

        // if (this.isInSelectModal) {
        //   this._fileSelectService.addSelectedItem(_si.appItemSelect);
        // }
      } else {
        // if (this.isInSelectModal) {
        //   this._fileSelectService.removeSelectedItem(_si.appItemSelect);
        // }
      }
    });

    // if in file select modal, will not remove previously selected items when drag
    if (this._itemSelectService.getIsInFileSelectVar()) {
    } else {
      this._itemSelectService.initSelectedItems(selectedItems);
      this.partialChecked = this.partiallyComplete();
      this.partialCheckedFile = this.partiallyCompleteFile();
      this.partialCheckedFolder = this.partiallyCompleteFolder();
    }
  }

  private getTempSelectableItem(_si: any): any {
    // if file
    if (FileStorageHelpers.checkIfFile(_si.appItemSelect)) {
      return this.tempSelectedItems.find(
        (_f) => _f.nameInDisk == _si.appItemSelect.nameInDisk
      );
    } else {
      return this.tempSelectedItems.find(
        (_f) => _f.id == _si.appItemSelect.id && !_f.originalName
      );
    }
  }

  // Checkbox Functions
  partiallyCompleteFile (): boolean {
    const selection = this.$selectableItems;
    let partialCheckedFile: boolean = false;
    if (selection?.length > 0) {
      const itemDirectives = selection.filter(item => item.appItemSelect.originalName);
      const totalItems = itemDirectives.length;
      const selectedCount = itemDirectives.filter(item => item.selected).length;
      if (selectedCount === totalItems) {
        this.allCheckedFile = true;
        this.allCheckedFileChange.emit(true);
        partialCheckedFile = false;
        this.partialCheckedFileChange.emit(false);
      } else {
        this.allCheckedFile = false;
        this.allCheckedFileChange.emit(false);
        if(selectedCount !== 0){
          partialCheckedFile = true;
          this.partialCheckedFileChange.emit(true);
        }else{
          partialCheckedFile = false;
          this.partialCheckedFileChange.emit(false);
        }
      }
    }
    return partialCheckedFile;
  };

  partiallyCompleteFolder (): boolean {
    const selection = this.$selectableItems;
    let partialCheckedFolder: boolean = false;
    if (selection?.length > 0) {
      const itemDirectives = selection.filter(item => !item.appItemSelect.originalName);
      const totalItems = itemDirectives.length;
      const selectedCount = itemDirectives.filter(item => item.selected).length;
      if (selectedCount === totalItems) {
        this.allCheckedFolder = true;
        this.allCheckedFolderChange.emit(true);
        partialCheckedFolder = false;
        this.partialCheckedFolderChange.emit(false);
      } else {
        this.allCheckedFolder = false;
        this.allCheckedFolderChange.emit(false);
        if(selectedCount !== 0){
          partialCheckedFolder = true;
          this.partialCheckedFolderChange.emit(true);
        }else{
          partialCheckedFolder = false;
          this.partialCheckedFolderChange.emit(false);
        }
      }
    }
    return partialCheckedFolder;
  };

  // Checkbox Functions
  partiallyComplete (): boolean {
    const selection = this.$selectableItems;
    let partialChecked: boolean = false;
    if (selection?.length > 0) {
      const totalItems = selection.length;
      const selectedCount = selection.filter(item => item.selected).length;
      if (selectedCount === totalItems) {
        this.allChecked = true;
        this.allCheckedChange.emit(true);
        partialChecked = false;
        this.partialCheckedChange.emit(false);
      } else {
        this.allChecked = false;
        this.allCheckedChange.emit(false);
        if(selectedCount !== 0){
          partialChecked = true;
          this.partialCheckedChange.emit(true);
        }else{
          partialChecked = false;
          this.partialCheckedChange.emit(false);
        }
      }
    }
    return partialChecked;
  };
}
