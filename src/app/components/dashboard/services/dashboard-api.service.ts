import { Injectable } from '@angular/core';
import { ApiService } from '@root/src/app/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  constructor(private apiService: ApiService) {}

  // Get from server
  public getDashboardData(): Observable<any> {
    return this.apiService.request('get', 'dashboard/index');
  }

  // create Playlist
  public createPlaylist(_playlistObject: any): Observable<any> {
    return this.apiService.request(
      'post',
      'playlist/create',
      _playlistObject
    );
  }

  // edit Playlist
  public editPlaylist(_playlistObject: any): Observable<any> {
    return this.apiService.request(
      'post',
      `playlist/${_playlistObject.id}/edit`,
      _playlistObject
    );
  }

  // delete Playlist
  public deletePlaylist(_playlistId: any): Observable<any> {
    return this.apiService.request('post', `playlist/${_playlistId}/delete`);
  }
}
