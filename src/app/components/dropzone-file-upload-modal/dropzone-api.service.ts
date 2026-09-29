import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@root/src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DropzoneApiService {

  constructor(
    private _apiService: ApiService
  ) { }


  /**
   * Save Google Map ifram in server
   */
  saveGoogleMapIframe(_iframe: any): Observable<any> {
    return this._apiService.request('post', '/file/create-google-map-iframe', _iframe);
  }
}
