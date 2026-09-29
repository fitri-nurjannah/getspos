import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PlaylistStatusDataService } from './services/playlist-status-data.service';

@Component({
  selector: 'app-playlist-status',
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './playlist-status.component.html',
  styleUrl: './playlist-status.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PlaylistStatusComponent implements OnInit, OnDestroy {
  layout: 'grid' | 'list' = 'grid';
  searchQuery = '';

  // Sort State (Pills):
  activeSortField: 'name' | 'subAccountStatus' = 'name';
  isSortAsc = true;

  subAccounts: WritableSignal<any[]> = signal([]);
  socketData: any = {};
  private _takeUntil = new Subject<void>();

  constructor(private playlistStatusDataService: PlaylistStatusDataService) {}

  ngOnInit(): void {
    this.getPlaylistStatusData();
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
  }

  toggleSort(field: 'name' | 'subAccountStatus'): void {
    if (this.activeSortField === field) {
      this.isSortAsc = !this.isSortAsc;
    } else {
      this.activeSortField = field;
      this.isSortAsc = true;
    }
  }

  // Universal Filter: Auto-filters name, status, and email
  get filteredAccounts(): any[] {
    let list = [...this.subAccounts()];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      list = list.filter((item) => {
        const name = String(item.name || '').toLowerCase();
        const status = String(item.subAccountStatus || '').toLowerCase();
        const email = String(item.mainAccountEmail || '').toLowerCase();
        return (
          name.includes(query) ||
          status.includes(query) ||
          email.includes(query)
        );
      });
    }

    const field = this.activeSortField;
    const order = this.isSortAsc ? 1 : -1;

    list.sort((a, b) => {
      const valA = String(a[field] || '').toLowerCase();
      const valB = String(b[field] || '').toLowerCase();
      return valA > valB ? order : valA < valB ? -order : 0;
    });

    return list;
  }

  getPlaylistStatusData(): void {
    this.playlistStatusDataService
      .subscribeNewData()
      .pipe(takeUntil(this._takeUntil))
      .subscribe((data) => {
        if (!data) return;
        this.subAccounts.set(data.subAccounts || []);
        this.socketData = data.socketData || {};
      });
  }
}