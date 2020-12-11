import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxElectronModule } from 'ngx-electron';
import { ScreenShareComponent } from './app/screen-share/screen-share.component';
import { BannerComponent } from './app/banner/banner/banner.component';
import { IonicModule } from '@ionic/angular';
import { BannerModalComponent } from './app/banner/banner-modal/banner-modal.component';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ColorPickerComponent } from './app/banner/color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ScreenShareComponent, BannerComponent, BannerModalComponent, ColorPickerComponent],
  entryComponents: [ScreenShareComponent, BannerComponent, ColorPickerComponent],
  imports: [CommonModule, NgxElectronModule, IonicModule, ColorSketchModule, FormsModule],
  providers: [],
  exports: [CommonModule, NgxElectronModule, ScreenShareComponent, BannerComponent]
})
export class SharedModule {
}
