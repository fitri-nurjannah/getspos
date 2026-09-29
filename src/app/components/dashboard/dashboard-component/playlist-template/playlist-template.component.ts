import { Component, EventEmitter, inject, OnInit, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { DialogRef } from '@angular/cdk/dialog';
import { templateObject } from '@root/src/app/interfaces/interfaces';
import { provideIcons } from '@ng-icons/core';
import { heroArrowRight } from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-playlist-template',
    imports: [FormsModule],
    templateUrl: './playlist-template.component.html',
    styleUrl: './playlist-template.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ heroArrowRight })]
})
export class PlaylistTemplateComponent {
  blockCount: 1 | 2 | null = null;
  selectedOrientation: 'vertical' | 'horizontal' | null = null;

  @Output() templateEmitter: EventEmitter<templateObject> = new EventEmitter();

  dialogRef = inject<DialogRef<templateObject>>(DialogRef<templateObject>);

  ngOnInit(): void {
    this.openModal();
  }

  openModal() {
    this.blockCount = 2; // Default to 2 blocks
    this.selectedOrientation = 'vertical'; // Default to vertical for 2 blocks
  }

  closeModal(data): void {
    let element = document.querySelector('.playlist-modal');
    element.classList.add('!animate-slidedownclose'); // add animation class
    this.dialogRef.close(data);
  }

  onBlockChange() {
    if (this.blockCount === 1) {
      this.selectedOrientation = null; // Reset orientation if 1 block is selected
    } else if (this.blockCount === 2 && !this.selectedOrientation) {
      this.selectedOrientation = 'vertical'; // Default to vertical if switching to 2 blocks and no orientation is set
    }
  }

  selectOrientation(orientation: 'vertical' | 'horizontal') {
    this.selectedOrientation = orientation;
  }

  canApply(): boolean {
    if (this.blockCount === 1) {
      return true;
    }
    if (this.blockCount === 2 && this.selectedOrientation !== null) {
      return true;
    }
    return false;
  }

  applyTemplate() {
    if (this.canApply()) {
      this.templateEmitter.emit({
        blocks: this.blockCount,
        orientation: this.selectedOrientation,
      });
      this.closeModal({ blocks: this.blockCount, orientation: this.selectedOrientation });
    }
  }
}