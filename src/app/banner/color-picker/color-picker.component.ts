import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ColorEvent, RGBA } from 'ngx-color';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ColorPickerComponent {
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onColorChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() color: RGBA = {
    r: 255,
    g: 0,
    b: 0,
    a: 0.8
  };

  handleChangeComplete(event: ColorEvent) {
    const rgba = event.color.rgb;
    const rgbaString = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    this.onColorChange.emit(rgbaString);
  }
}
