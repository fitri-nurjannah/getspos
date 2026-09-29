// file-icon.service.ts
import { Injectable } from '@angular/core';

export interface IconConfig {
  name: string;
  colorClass: string;
}

@Injectable({ providedIn: 'root' })
export class FileIconService {
  private readonly DEFAULT_ICON: IconConfig = { name: 'heroDocument', colorClass: 'text-gray-400' };

  private readonly CONFIG: Record<string, IconConfig> = {
    'googleMap': { name: 'heroMapPin', colorClass: 'text-orange-500' },
    'youtube': { name: 'heroPlay', colorClass: 'text-purple-600' },
    'application/pdf': { name: 'heroDocumentText', colorClass: 'text-red-600' },
    'audio/mpeg': { name: 'heroMusicalNote', colorClass: 'text-blue-600' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 
        { name: 'heroPresentationChartBar', colorClass: 'text-orange-600' },
  };

  getIcon(fileType: string | undefined): IconConfig {
    if (!fileType) return this.DEFAULT_ICON;

    // 1. Check direct mapping
    if (this.CONFIG[fileType]) return this.CONFIG[fileType];

    // 2. Check by prefix (image/png, video/mp4)
    const prefix = fileType.split('/')[0];
    if (prefix === 'image') return { name: 'heroPhoto', colorClass: 'text-red-500' };
    if (prefix === 'video') return { name: 'heroVideoCamera', colorClass: 'text-purple-600' };

    return this.DEFAULT_ICON;
  }
}