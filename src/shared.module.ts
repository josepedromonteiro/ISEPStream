import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxElectronModule } from 'ngx-electron';
import { ScreenShareComponent } from './app/screen-share/screen-share.component';

@NgModule({
  declarations: [ScreenShareComponent],
  entryComponents: [ScreenShareComponent],
  imports: [CommonModule, NgxElectronModule],
  providers: [],
  exports: [CommonModule, NgxElectronModule, ScreenShareComponent]
})
export class SharedModule {
}
