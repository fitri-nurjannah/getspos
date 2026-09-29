import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SliderFile } from '@root/src/app/interfaces/interfaces';
import { FileStorageHelpers } from '../file-storage.helpers';

@Injectable({
  providedIn: 'root',
})

export class ItemSelectService {
  private _inFileSelectModal: boolean;
  private _selectedItems: BehaviorSubject<SliderFile[]> = new BehaviorSubject<
    SliderFile[]
  >([]);

  constructor() {}

  get selectedItems$(): Observable<SliderFile[]> {
    return this._selectedItems.asObservable();
  }

  removeSelectedItem(_item: SliderFile): void {
    let tempItems = this._selectedItems.value;
    tempItems = tempItems.filter((_f) => _f.id != _item.id);
    this._selectedItems.next(tempItems);
  }

  addSelectedItem(_item: any): void {
    const tempItems = this._selectedItems.value;

    let isItemInSelectedArray;
    // if file
    if (FileStorageHelpers.checkIfFile(_item)) {
      isItemInSelectedArray = tempItems.find(
        (_f) => _f.originalName == _item.originalName && _f.id == _item.id
      );
    } else {
      isItemInSelectedArray = tempItems.find(
        (_f) => _f.id == _item.id && !_f.originalName
      );

      // selecting true for in file select modal, so folders will not be selected
      if (this._inFileSelectModal) {
        isItemInSelectedArray = true;
      }
    }
    // const itemInSelectedArray = tempItems.find((_f) => _f.id == _item.id);

    // if item is not already in selected items, then add it
    if (!isItemInSelectedArray) {
      tempItems.push(_item);
      this._selectedItems.next(tempItems);
    }
  }

  initSelectedItems(_initialDataArray: any[]): void {
    this._selectedItems.next(_initialDataArray);
  }

  setIsInFileSelectVar(_val: boolean): void {
    this._inFileSelectModal = _val;
  }

  getIsInFileSelectVar(): boolean {
    return this._inFileSelectModal;
  }
}
