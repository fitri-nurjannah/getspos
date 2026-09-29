import { Injectable } from '@angular/core';
import { ApiService } from '@root/src/app/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaylistStatusApiService {
  constructor(private apiService: ApiService) {}

  // Get from server
  public getPlaylistData(): Observable<any> {
    return this.apiService.request('get', 'playlist-status/index');
  }
}
