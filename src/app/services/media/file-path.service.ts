import { Injectable } from '@angular/core';
import { SliderFile } from '@root/src/app/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class FilePathService {
  private readonly ICON_MAPPING: Record<string, string> = {
    'googleMap': 'google-maps-icon.jpg',
    'youtube': 'youtube.png',
    'application/pdf': 'pdf.png',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx.png',
    'audio/mpeg': 'mp3.png',
  };

  getPath(item: SliderFile | null | undefined): string {
    if (!item) return 'assets/images/placeholder.png';

    if (this.ICON_MAPPING[item.type]) {
      return `./assets/images/${this.ICON_MAPPING[item.type]}`;
    }

    if (item.type?.startsWith('video/')) {
      return `./assets/images/userFiles/${item.nameInDisk}.png`;
    }

    return `./assets/images/userFiles/${item.nameInDisk}`;
  }
}