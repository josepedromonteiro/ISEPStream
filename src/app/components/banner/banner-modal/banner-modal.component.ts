import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { BannerData, BannerMode } from '../banner/banner.component';
import { ModalController, NavParams } from '@ionic/angular';
import { DesktopCapturerSource } from 'electron';

@Component({
  selector: 'app-banner-modal',
  templateUrl: './banner-modal.component.html',
  styleUrls: ['./banner-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BannerModalComponent implements AfterViewInit {

  public mode: typeof BannerMode = BannerMode;

  @Input() bannerData: BannerData;

  public iBannerData: BannerData = {
    color: 'rgba(232,0,0,.5)'
  };

  constructor(private modalController: ModalController,
              private navParams: NavParams) {
  }

  public confirm(): void {
    if (!this.iBannerData.title && !this.iBannerData.subtitle) {
      return;
    }
    this.modalController.dismiss(this.iBannerData);
  }

  public close(): void {
    this.modalController.dismiss();
  }

  ngAfterViewInit(): void {
    const bannerData: BannerData = this.navParams.get('bannerData');
    this.iBannerData = { ...this.iBannerData, ...bannerData };
  }
}
