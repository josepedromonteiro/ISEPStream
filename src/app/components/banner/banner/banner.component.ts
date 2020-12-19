import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { ColorEvent, RGBA } from 'ngx-color';
import { PopoverController } from '@ionic/angular';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export enum BannerMode {
  EDIT, VIEW
}

export interface BannerData {
  show?: boolean;
  title?: string;
  subtitle?: string;
  color?: string;
  descriptionTimeout?: number;
  click?: {
    onChange?: () => void,
    onRemove?: () => void
    onHide?: () => void;
  };
}

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BannerComponent implements AfterViewInit, OnChanges, OnDestroy {

  public bMode: typeof BannerMode = BannerMode;
  public classes = '';
  public showOptions = false;
  private destroyer: Subject<void> = new Subject<void>();
  @Input() data: BannerData = {};
  @Input() mode: BannerMode = BannerMode.VIEW;

  constructor(public popoverController: PopoverController,
              private detectChanges: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    // this.animateBanner();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue) {
      this.animateBanner();
    }
  }

  private animateBanner(): void {
    if (!this.data?.subtitle) {
      return;
    }
    this.classes = '';
    this.detectChanges.detectChanges();
    setTimeout(() => {
      this.classes = 'compact';
      this.detectChanges.detectChanges();
    }, this.data.descriptionTimeout || 3000);
  }


  async presentColorPicker(event: Event) {
    const eventEmitter: EventEmitter<string> = new EventEmitter();
    eventEmitter.pipe(takeUntil(this.destroyer)).subscribe((color: string) => {
      this.data.color = color;
    });

    const popover = await this.popoverController.create({
      component: ColorPickerComponent,
      translucent: true,
      mode: 'ios',
      event,
      cssClass: 'white-popover',
      componentProps: {
        onColorChange: eventEmitter
      }
    });
    popover.present();
  }

  ngOnDestroy(): void {
    this.destroyer.complete();
  }


}
