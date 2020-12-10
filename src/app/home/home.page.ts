import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { Subject } from 'rxjs';
import { StreamingService } from '../stream-area/components/stream-area/streaming.service';
import { BannerData } from '../banner/banner/banner.component';
import { ScreenShareComponent } from '../screen-share/screen-share.component';
import { iosEnterAnimation, iosLeaveAnimation } from '../screen-share/screen-share.animations';
import { ModalController } from '@ionic/angular';
import { BannerModalComponent } from '../banner/banner-modal/banner-modal.component';
import { isEmpty } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';


declare var WindowPeerConnection;
export type StreamChannelType = 'webcam' | 'ip-camera' | 'screen-share';

export interface StreamChannel {
  id: string;
  name: string;
  type: StreamChannelType;
  url?: string;
  preview: string;
  stream?: MediaStream;
}

export interface OverlayInfo {
  logo?: string;
  banner?: {
    title: string;
    text: string;
  };
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage implements AfterViewInit, OnDestroy {

  public channels: StreamChannel[] = [];
  public activeStreamChannel: StreamChannel;
  // private rtcpPeerConnection: RTCPeerConnection;
  private isLiveSteaming = false;
  private destroyer: Subject<void>;
  private mainWindow: typeof WindowPeerConnection;
  private secondWindow: typeof WindowPeerConnection;
  public previousBackground: string;
  public currentBackground: string;
  public animatingBackground = false;
  public overlayInfo: OverlayInfo = {};
  public bannerData: BannerData;
  private toBase64: (file) => Promise<string> = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  constructor(private streamingService: StreamingService,
              private modalController: ModalController,
              private electronService: ElectronService) {

    this.channels = [
      {
        id: 'webcam',
        name: 'Local Camera',
        preview: 'assets/images/background1.jpeg',
        type: 'webcam'
      },
      {
        id: 'ipvideo',
        name: 'IP Camera',
        preview: 'assets/images/background2.png',
        url: 'ws://localhost:9999',
        type: 'ip-camera'
      },
      {
        id: 'share-screen',
        name: 'Screen share',
        preview: 'assets/images/background3.jpeg',
        type: 'screen-share'
      },
    ];

    // this.activeStreamChannel = this.channels[0];
    this.destroyer = new Subject();

    try {
      this.mainWindow = new WindowPeerConnection('mainWindow');
      this.secondWindow = new WindowPeerConnection('secondWindow');
    } catch (e) {
      console.error(e);
    }

    this.bannerData = {
      show: false,
      click: {
        onChange: () => {
          this.addBanner();
        },
        onRemove: () => {
          this.bannerData.show = false;
          this.bannerData.title = undefined;
          this.bannerData.subtitle = undefined;
          this.bannerData.color = undefined;
          this.sendDataViaIPC('banner', this.bannerData);
        },
        onHide: () => {
          this.bannerData.show = false;
          this.sendDataViaIPC('banner', this.bannerData);
        }
      }
    };
  }

  ngAfterViewInit(): void {
    this.previousBackground = 'assets/images/background.jpg';
  }

  public onChannelChange(event: StreamChannel) {
    this.activeStreamChannel = { ...event };
    setTimeout(() => {
      document.getElementById('active-container').innerHTML = '';
      const canvasMediaContainer: any = document.getElementById('active-container') as HTMLCanvasElement;
      switch (event.type) {
        case 'ip-camera':
          initIPCamera(event.url, canvasMediaContainer);
          break;
        case 'webcam':
          appendWebcam(event.stream, canvasMediaContainer);
          break;
        case 'screen-share':
          appendWebcam(event.stream, canvasMediaContainer);
          break;
      }
      this.streamingService.onChangeStreamChanel.next(event);
      this.startLiveStream();
    }, 500);

    this.currentBackground = this.activeStreamChannel.preview;
    this.animateBackground();
    setTimeout(() => {
      this.previousBackground = this.activeStreamChannel.preview;
    }, 2000);
  }

  public async startLiveStream() {
    await this.secondWindow.removeStream();
    await this.mainWindow.removeStream();
    this.mainWindow.attachStream(this.activeStreamChannel.stream);
    this.mainWindow.sendStream('secondWindow');
    this.isLiveSteaming = true;
  }

  public cleanStage(): void {
    this.isLiveSteaming = false;
    this.activeStreamChannel = null;

    this.currentBackground = 'assets/images/background.jpg';
    this.animateBackground();
    setTimeout(() => {
      this.previousBackground = this.activeStreamChannel.preview;
    }, 2000);
    document.getElementById('active-container').innerHTML = '';
    this.streamingService.onStopSharing.next(true);


    this.secondWindow.removeStream();
    this.mainWindow.removeStream();
    this.mainWindow.attachStream(null);
    this.mainWindow.sendStream('secondWindow');

  }

  ngOnDestroy(): void {
    this.destroyer.next();
  }

  private animateBackground(): void {
    this.animatingBackground = true;
    setTimeout(() => {
      this.animatingBackground = false;
    }, 2000);
  }

  public async handleFileInput(files: File[]): Promise<void> {
    const logo: string = await this.toBase64(files[0]);
    this.overlayInfo.logo = logo;
    this.sendDataViaIPC('logo', this.overlayInfo.logo);
  }


  public async addBanner(): Promise<void> {
    const modal = await this.modalController.create({
      component: BannerModalComponent,
      cssClass: 'new-modal',
      enterAnimation: iosEnterAnimation,
      leaveAnimation: iosLeaveAnimation,
      componentProps: {
        bannerData: this.bannerData
      }
    });
    modal.present();
    modal.onDidDismiss().then((data) => {
      if (!data?.data) {
        return;
      }
      this.bannerData = { ...this.bannerData, ...data.data };
      this.bannerData.show = true;
      this.sendDataViaIPC('banner', this.bannerData);
    });
  }

  removeLogo() {
    this.overlayInfo.logo = null;
    this.sendDataViaIPC('logo', '');
  }

  sendDataViaIPC(channel: string, data: string | BannerData) {
    let d = data;
    if ((data as BannerData).click) {
      d = { ...data as BannerData, click: null };
    }
    this.electronService.ipcRenderer.sendTo(
      this.electronService.remote.getGlobal('secondWindow').webContents.id,
      channel,
      d
    );
  }

  public showBanner(): void {
    this.bannerData.show = true;
    this.sendDataViaIPC('banner', this.bannerData);
  }

  onRemoveStream(remove: boolean) {
    if (remove) {
      this.cleanStage();
    }
  }

  startOnlineStream() {
    // /Applications/OBS.app/Contents/MacOS/OBS --startstreaming --scene "Cena 2"
    //https://github.com/obsproject/obs-studio/wiki/Launch-Parameters

    const { exec } = this.electronService.remote.require('child_process');
    exec('/Applications/OBS.app/Contents/MacOS/OBS --startstreaming --scene "Cena 2"', (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }

      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.error(error);
      }
    });
  }

  startRecording() {
    const { exec } = this.electronService.remote.require('child_process');
    exec('/Applications/OBS.app/Contents/MacOS/OBS --startrecording --scene "Cena 2"', (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }

      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.error(error);
      }
    });
  }
}

export function log(message: string) {
  console.error(message);
}

export function initIPCamera(url: string, canvas: any): MediaStream {
  const element = new JSMpeg.VideoElement(canvas, url, {});
  const stream = element.els.canvas.captureStream() as MediaStream;

  element.els.canvas.setAttribute('id', 'active-element');

  return stream;
}


export function initWebcam(parentElement: HTMLElement): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream: MediaStream) => {
      appendWebcam(stream, parentElement);
      return stream;
    }).catch((err) => {
      console.error(err);
      return null;
    });
}

export function appendWebcam(video: MediaStream, parent: HTMLElement): HTMLVideoElement {

  const videoChildren = parent.getElementsByTagName('video');
  Array.from(videoChildren).forEach((videoChild: HTMLVideoElement) => {
    parent.removeChild(videoChild);
  });

  const el = document.createElement('video');
  el.srcObject = video;
  el.autoplay = true;
  el.muted = true;
  el.width = 160;
  el.height = 120;

  parent.prepend(el);

  return el;
}



