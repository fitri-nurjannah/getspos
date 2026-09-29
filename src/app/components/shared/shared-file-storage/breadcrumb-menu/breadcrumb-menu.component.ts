import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Folder } from '@root/src/app/interfaces/interfaces';
import { FileStorageService } from '../file-storage.service';
import { IBreadcrumbMenu } from './breadcrumb-menu.types';

import { MatButton } from '@angular/material/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRight } from '@ng-icons/heroicons/outline';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-breadcrumb-menu',
    templateUrl: './breadcrumb-menu.component.html',
    styleUrls: ['./breadcrumb-menu.component.css'],
    imports: [
        MatButton,
        NgIcon,
        CommonModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [
        provideIcons({ heroChevronRight })
    ]
})
export class BreadcrumbMenuComponent implements OnInit, OnDestroy {
  @Input() parentFolderId: number;
  @Output()
  breadcrumbMenuChangedEmitter: EventEmitter<number> = new EventEmitter<number>();

  menuItems: IBreadcrumbMenu[] = [];

  folders: Folder[] = [];

  _takeUntil: Subject<void> = new Subject();

  constructor(private _fileStorageService: FileStorageService) {}

  ngOnInit(): void {
    this.subcribeToFoldersArray();
    this.update();
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  update(): void {
    let parentFolderId = this.parentFolderId ? this.parentFolderId : null;
    const tempMenuItems: IBreadcrumbMenu[] = [];

    // id is not null
    if (parentFolderId) {
      while (parentFolderId != null) {
        const currentFolder = this.folders.find(
          (_f) => _f.id == parentFolderId
        );
        tempMenuItems.unshift({
          label: currentFolder.name,
          id: currentFolder.id,
        });

        parentFolderId = currentFolder.parentFolderId;
      }
    }

    tempMenuItems.unshift({ label: 'Home', id: null });
    this.menuItems = tempMenuItems;
  }

  menuItemClicked(_itemId: number): void {
    this.parentFolderId = _itemId;
    this.update();
    this.breadcrumbMenuChangedEmitter.emit(_itemId);
  }

  private subcribeToFoldersArray(): void {
    this._fileStorageService.getFolders
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_folders: Folder[]) => {
        this.folders = _folders;
        this.update();
      });
  }
}
