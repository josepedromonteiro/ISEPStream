import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxElectronModule } from 'ngx-electron';
import { ScreenShareComponent } from './app/components/screen-share/screen-share.component';
import { BannerComponent } from './app/components/banner/banner/banner.component';
import { IonicModule } from '@ionic/angular';
import { BannerModalComponent } from './app/components/banner/banner-modal/banner-modal.component';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ColorPickerComponent } from './app/components/banner/color-picker/color-picker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaylistComponent } from './app/components/playlist/playlist.component';
import { PlaylistModalComponent } from './app/components/playlist-modal/playlist-modal.component';

@NgModule({
  declarations: [ScreenShareComponent, BannerComponent, BannerModalComponent, ColorPickerComponent, PlaylistComponent, PlaylistModalComponent],
  entryComponents: [ScreenShareComponent, BannerComponent, ColorPickerComponent],
  imports: [CommonModule, NgxElectronModule, IonicModule, ColorSketchModule, FormsModule, ReactiveFormsModule],
  providers: [],
  exports: [CommonModule, NgxElectronModule, ScreenShareComponent, BannerComponent, PlaylistComponent, PlaylistModalComponent]
})
export class SharedModule {
}
