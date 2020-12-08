import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { StreamingService } from './streaming.service';
import { ElectronService } from 'ngx-electron';
import { BannerData } from '../../../banner/banner/banner.component';
// const WindowPeerConnection = require('electron-peer-connection').WindowPeerConnection;

declare var WindowPeerConnection;


@Component({
  selector: 'app-stream-area',
  templateUrl: './stream-area.component.html',
  styleUrls: ['./stream-area.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StreamAreaComponent implements OnInit {

  @ViewChild('videoElement') videoElement: ElementRef;
  public logo: string;
  public banner: BannerData = {};
  public hasVideo = false;

  constructor(public electronService: ElectronService,
              private detectChange: ChangeDetectorRef) {
  }

  ngOnInit() {
    setTimeout(() => {
      const secondWindow = new WindowPeerConnection('secondWindow');
      secondWindow.onReceivedStream((stream) => {
        if (!stream) {
          this.hasVideo = false;
          this.videoElement.nativeElement.srcObject = null;
          this.detectChange.detectChanges();
          return;
        }
        this.hasVideo = true;
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.autoplay = true;
        this.videoElement.nativeElement.muted = true;
        this.detectChange.detectChanges();
      });
    }, 3000);

    this.electronService.ipcRenderer.on('logo', (event: Electron.IpcRendererEvent, logo: string) => {
      this.logo = logo;
      this.detectChange.detectChanges();
    });

    this.electronService.ipcRenderer.on('banner', (event: Electron.IpcRendererEvent, banner: BannerData) => {
      this.banner = banner;
      this.detectChange.detectChanges();
    });

  }

}
