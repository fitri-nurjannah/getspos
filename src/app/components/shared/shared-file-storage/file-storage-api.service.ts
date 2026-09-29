import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@root/src/app/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class FileStorageApiService {
  constructor(private _apiService: ApiService) {}

  // delete subaccount
  getFilesAndFolders(): Observable<any> {
    return this._apiService.request('get', 'folder/index');
  }

  createFolder(_folderName: string, _parentFolderId: number): Observable<any> {
    return this._apiService.request('post', 'folder/create', {
      parentFolderId: _parentFolderId,
      folderName: _folderName,
    });
  }
  renameFolder(
    _folderName: string,
    _folderId: number,
    _parentFolderId: number
  ): Observable<any> {
    return this._apiService.request('put', 'folder/' + _folderId, {
      parentFolderId: _parentFolderId,
      folderName: _folderName,
    });
  }

  deleteItems(selectedItems: any[]): Observable<any> {
    return this._apiService.request('post', 'folder/delete-items', {
      selectedItems: selectedItems,
    });
  }

  moveSelectedItems(
    selectedItems: any[],
    _parentFolderId: number
  ): Observable<any> {
    return this._apiService.request('post', 'folder/move-items', {
      parentFolderId: _parentFolderId,
      selectedItems: selectedItems,
    });
  }
}
