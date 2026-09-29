import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SharedFileStorageComponent } from '../shared/shared-file-storage/shared-file-storage-component/shared-file-storage.component';

@Component({
    selector: 'app-file-storage-component',
    template: '<app-shared-files-storage [isInSelectModal]="false" [forSelectingSliderCoverImage]="false" [disableDragAndMove]="false"></app-shared-files-storage>',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SharedFileStorageComponent]
})
export class FileStorageComponentComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
