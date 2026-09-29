import { inject, Pipe, PipeTransform } from '@angular/core';
import { FileIconService, IconConfig } from '../services/media/file-icon.service';

@Pipe({
  name: 'fileIcon',
  standalone: true
})
export class FileIconPipe implements PipeTransform {

  private iconService = inject(FileIconService);

  transform(fileType: string | undefined): IconConfig {
    return this.iconService.getIcon(fileType);
  }

}
