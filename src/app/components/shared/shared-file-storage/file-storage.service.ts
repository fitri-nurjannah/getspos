import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Folder, SliderFile } from '@root/src/app/interfaces/interfaces';
import { UserLimitsInfoService } from '../user-limits-table/user-limits-info.service';
import { FileStorageApiService } from './file-storage-api.service';
import { FileStorageHelpers } from './file-storage.helpers';

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  isFirstTimeDataInitialized = false;
  private $files: BehaviorSubject<SliderFile[]> = new BehaviorSubject<
    SliderFile[]
  >([]);
  private $folders: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>(
    []
  );

  constructor(
    private _fileStorageApi: FileStorageApiService,
    private _userLimitInfosService: UserLimitsInfoService
  ) {}

  /**
   * getters
   */
  public get getFiles(): Observable<SliderFile[]> {
    if (!this.isFirstTimeDataInitialized) {
      this.isFirstTimeDataInitialized = true;
      this.initDataFromServer();
    }
    return this.$files.asObservable();
  }

  public get getFolders(): Observable<Folder[]> {
    if (!this.isFirstTimeDataInitialized) {
      this.isFirstTimeDataInitialized = true;
      this.initDataFromServer();
    }
    return this.$folders.asObservable();
  }

  /**
   * Functions
   */

  initDataFromServer(): void {
    this._fileStorageApi.getFilesAndFolders().subscribe((_obj) => {
      if (_obj) {
        this.$files.next(_obj.files);
        this.$folders.next(_obj.folders);
      }
    });
  }

  moveSelectedItems(_selectedItems: any[], _parentFolderId): Observable<any> {
    return this._fileStorageApi
      .moveSelectedItems(_selectedItems, _parentFolderId)
      .pipe(
        map(() => {
          const files = this.$files.value;
          const folders = this.$folders.value;

          _selectedItems.forEach((_si) => {
            // if file
            if (FileStorageHelpers.checkIfFile(_si)) {
              const file = files.find((_f) => _f.id == _si.id);
              file.folderId = _parentFolderId;
            } else {
              const folder = folders.find((_f) => _f.id == _si.id);
              folder.parentFolderId = _parentFolderId;
            }
          });

          this.$files.next(files);
          this.$folders.next(folders);
          return null;
        })
      );
  }

  createFolder(_folderName: string, _parentFolderId: number): Observable<any> {
    return this._fileStorageApi.createFolder(_folderName, _parentFolderId).pipe(
      map((_newFolder: Folder) => {
        const folders = this.$folders.value;
        folders.unshift(_newFolder);
        this.$folders.next(folders);
        return _newFolder;
      })
    );
  }

  renameFolder(folderName, folderId, parentFolderid): Observable<any> {
    return this._fileStorageApi
      .renameFolder(folderName, folderId, parentFolderid)
      .pipe(
        map(() => {
          const folders = this.$folders.value;
          folders.forEach((_f) => {
            if (_f.id == folderId) {
              _f.name = folderName;
            }
          });
          this.$folders.next(folders);
        })
      );
  }
  deleteItems(_selectedItems: any[]): Observable<any> {
    return this._fileStorageApi.deleteItems(_selectedItems).pipe(
      map((response: any) => {
        this._userLimitInfosService.updateUserLimitInfos();
        
        const files = [...this.$files.value];
        const folders = [...this.$folders.value];

        // LOGIC: Use the IDs returned by the server, not the ones we sent
        const deletedFileIds: number[] = response.deletedFileIds || [];
        const deletedFolderIds: number[] = response.deletedFolderIds || [];

        deletedFileIds.forEach((id) => {
          const index = files.findIndex((_f) => _f.id === id);
          if (index !== -1) files.splice(index, 1);
        });

        deletedFolderIds.forEach((id) => {
          const index = folders.findIndex((_f) => _f.id === id);
          if (index !== -1) folders.splice(index, 1);
        });

        this.$files.next(files);
        this.$folders.next(folders);
        return null;
      })
    );
  }
}
