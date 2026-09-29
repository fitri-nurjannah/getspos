import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Pipe({
    name: 'domSecurePipe',
    standalone: true
})
export class DomSecurePipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) {}
  transform(value: string, _type?: 'resource' | 'style'): any {
    // console.log(value, _type);
    if (_type === 'resource') {
      return this._sanitizer.bypassSecurityTrustResourceUrl(value);
    } else if (_type === 'style') {
      return this._sanitizer.bypassSecurityTrustStyle(value);

    }
  }
}
