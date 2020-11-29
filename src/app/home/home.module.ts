import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { WebcamModule } from 'ngx-webcam';
import { CardVideoComponent } from '../card-video/card-video.component';
import { ONVIFModule } from 'onvif-rx-angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    WebcamModule,
    ONVIFModule
  ],
  declarations: [HomePage, CardVideoComponent]
})
export class HomePageModule {}
