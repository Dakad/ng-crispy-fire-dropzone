import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[appScrollable]'
})
export class ScrollableDirective {
  @Output() scrollPosition = new EventEmitter<string>();

  constructor(private el: ElementRef) {}

  @HostListener('scroll', ['$event'])
  onScroll(event): void {
    try {
      const top = event.target.scroolTop; //

      const height = this.el.nativeElement.scroolHeight;
      const offset = this.el.nativeElement.offsetHeight;

      // ? Has reached the bottom ??
      if (top > height - offset - 1) {
        this.scrollPosition.emit('down');
      }

      if (top === 0) {
        this.scrollPosition.emit('up');
      }
    } catch (e) {}
  }
}
