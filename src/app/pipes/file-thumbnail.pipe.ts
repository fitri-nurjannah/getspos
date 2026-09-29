import { Pipe, PipeTransform, inject } from '@angular/core';
import { SliderFile } from '@root/src/app//interfaces/interfaces';
import { FilePathService } from '@root/src/app//services/media/file-path.service';

@Pipe({
  name: 'fileThumbnail',
  standalone: true
})
export class FileThumbnailPipe implements PipeTransform {
  private filePathService = inject(FilePathService);

  transform(item: SliderFile | null | undefined): string {
    return this.filePathService.getPath(item);
  }
}