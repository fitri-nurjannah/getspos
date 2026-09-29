import { CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SliderFile } from '@root/src/app/interfaces/interfaces';

import { ChangeDetectionStrategy, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DomSecurePipe } from '@root/src/app/pipes/domSecurePipe';
import { heroCheck, heroTrash, heroCalendarDateRange } from '@ng-icons/heroicons/outline';
import { ionCalendar, ionCalendarOutline } from '@ng-icons/ionicons';
import { FileThumbnailPipe } from '@root/src/app/pipes/file-thumbnail.pipe';
import { FilePathService } from '@root/src/app/services/media/file-path.service';
import { DatePipe, NgClass } from '@angular/common';

@Component({
    selector: 'template-dragable-items-list',
    templateUrl: './dragable-items-list.component.html',
    styleUrls: ['./dragable-items-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CdkDropListGroup,
        CdkDropList,
        NgIcon,
        CdkDrag,
        CdkDragPlaceholder,
        DomSecurePipe,
        FileThumbnailPipe,
        DatePipe,
        NgClass
    ],
    viewProviders: [
        provideIcons({ heroCheck, heroTrash, heroCalendarDateRange, ionCalendar, ionCalendarOutline }),
    ]
})
export class DragableItemsListComponent implements OnInit, AfterViewInit {
  public filePathService = inject(FilePathService); 
  @Input()
  selectedItems: SliderFile[] = [];

  @Input()
  filesFG: FormGroup;

  @Output()
  showSelectFilesModalEmitter: EventEmitter<SliderFile[]> = new EventEmitter();

  @Output()
  selectedItemEmitter: EventEmitter<SliderFile[]> = new EventEmitter();

  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  dragStarted = false;
  allChecked = false;

  constructor() {
  }

  ngOnInit(): void {
    this.selectedItems = this.selectedItems.map(item => {
      const pivot = (item as any).playlistfile;
    
      return { 
        ...item, 
        itemChecked: false,
        expiresAt: pivot && pivot.expiresAt ? pivot.expiresAt : null 
      };
    }).sort((a, b) => {
      return (a as any).playlistfile.sortPosition - (b as any).playlistfile.sortPosition;
    });
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;
    phElement.style.display = 'none';
    phElement.parentNode.removeChild(phElement);
  }

  showSelectFilesModal(): void {
    this.showSelectFilesModalEmitter.emit(this.selectedItems);
  }

  getTooltip(_selectedItem: SliderFile): string {
    const fileExt = _selectedItem.nameInDisk
      ? '.' + _selectedItem.nameInDisk?.split('.')[1]
      : '';
    return 'Remove "' + _selectedItem.originalName + fileExt + '"';
  }

  removeSelectedItem(_itemId: number): void {
    this.selectedItems = this.selectedItems.filter((_si) => _si.id != _itemId);
    this.filesFG
      .get('selectedItems')
      .patchValue(this.selectedItems);
    this.selectedItemEmitter.emit(this.selectedItems);
  }

  removeMultipleSelectedItems(): void {
    this.selectedItems = this.selectedItems.filter((_si) => !_si.itemChecked);
    this.filesFG
      .get('selectedItems')
      .patchValue(this.selectedItems);
    this.updateCheckbox(false);
    this.allChecked = false;
    this.selectedItemEmitter.emit(this.selectedItems);
  }

  ////////////////////////////////////////////////////////////////
  //////////// DRAG DROP FUNCTIONS ///////////////////////////////
  ////////////////////////////////////////////////////////////////
  userStartedDrag(): void {
    this.dragStarted = true;
  }

  drop(event: CdkDragDrop<string[]>) {
    this.dragStarted = false;
    moveItemInArray(this.selectedItems, event.previousIndex, event.currentIndex);
    this.filesFG
      .get('selectedItems')
      .patchValue(this.selectedItems);
  }

  // Checkbox Functions
  partiallyComplete(): boolean {
    if (!this.selectedItems) {
      return false;
    }
    return this.selectedItems.some(t => t.itemChecked) && !this.selectedItems.every(t => t.itemChecked);
  };

  updateCheckbox(checked: boolean, index?: number) {
    if (index === undefined) {
      this.selectedItems = this.selectedItems.map(item => ({ ...item, itemChecked: checked }));
      this.allChecked = checked;
    } else {
      this.selectedItems[index].itemChecked = checked;
      this.allChecked = this.selectedItems?.every(t => t.itemChecked) ?? true;
    }
  }

  onDateChange(event: any, index: number) {
    const dateValue = event.target.value; // This is already "YYYY-MM-DD"
    if (dateValue) {
      const finalDateTime = `${dateValue}T23:59:59`;
      
      // Save as a string or Date object depending on what your API needs
      this.selectedItems[index].expiresAt = finalDateTime; 

      this.filesFG
      .get('selectedItems')
      .patchValue(this.selectedItems);
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-CA'); 
  }

  previewImage(item: SliderFile, elementId: any) {
    // Guard: Stop if on a phone
    const img = this.filePathService.getPath(item);
    if (window.innerWidth < 768) return;
  
    const modal = document.getElementById("img-preview");
    const modalImg = document.getElementById("modal-img") as HTMLImageElement;
    const trigger = document.getElementById('hover-' + elementId);
  
    if (modal && trigger && modalImg) {
      const rect = trigger.getBoundingClientRect();
      const isRightSide = rect.left > (window.innerWidth / 2);
  
      modalImg.src = img;
  
      // Remove hidden AND explicitly set display to flex
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
  
      // Position calculation
      setTimeout(() => {
        const modalWidth = modal.offsetWidth;
        modal.style.top = `${rect.top}px`;
  
        if (isRightSide) {
          modal.style.left = `${rect.left - modalWidth - 12}px`;
        } else {
          modal.style.left = `${rect.right + 12}px`;
        }
      }, 0);
    }
  }
  
  closePreview() {
    const modal = document.getElementById("img-preview");
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none'; // Ensure it is fully hidden
    }
  }
}
