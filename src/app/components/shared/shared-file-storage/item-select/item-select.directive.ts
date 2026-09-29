import {
  Directive,
  DoCheck,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
    selector: '[appItemSelect]',
    exportAs: 'appItemSelect',
    standalone: true,
})
export class ItemSelectDirective implements DoCheck {
  @Input()
  appItemSelect;

  // private boxBoundries;
  // get value(): ItemSelectByDragDirective {
  //   return this;
  // }

  public selected = false;

  constructor(private renderer: Renderer2, private host: ElementRef) {}

  ngDoCheck(): void {
    this.applySelectedClass();
  }

  public getBoundries(): any {
    // if (!this.boxBoundries) {
    return this.host.nativeElement.getBoundingClientRect();
    // }

    // return this.boxBoundries;
  }
  private applySelectedClass(): void {
    if (this.selected) {
      this.renderer.addClass(
        this.host.nativeElement,
        'select-by-drag-selected'
      );
    } else {
      this.renderer.removeClass(
        this.host.nativeElement,
        'select-by-drag-selected'
      );
    }
  }
}
