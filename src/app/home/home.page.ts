import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { Subject } from 'rxjs';


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

  constructor() {

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

    this.mainWindow = new WindowPeerConnection('mainWindow');
    this.secondWindow = new WindowPeerConnection('secondWindow');
  }

  ngAfterViewInit(): void {
    this.previousBackground = 'assets/images/background.jpg';
  }

  // private createRTCPConnection() {
  //   this.rtcpPeerConnection = new RTCPeerConnection({
  //     iceServers: [
  //       {
  //         urls: 'stun:stun.l.google.com:19302'
  //       }
  //     ]
  //   });
  // }

  public onChannelChange(event: StreamChannel) {
    this.activeStreamChannel = event;
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

      if (this.isLiveSteaming) {
        this.startLiveStream();
      }
    }, 500);

    this.currentBackground = this.activeStreamChannel.preview;
    this.animateBackground();
    setTimeout(() => {
      this.previousBackground = this.activeStreamChannel.preview;
    }, 2000);
  }


  // private getRemoteSessionDescription(localSessionDescription: string): Observable<string> {
  //   const url = 'http://localhost:3000/keys';
  //   const body = {
  //     streamKey: localSessionDescription
  //   };
  //
  //   return this.http.post<string>(url, body, { responseType: 'text' as 'json' }).pipe(
  //     takeUntil(this.destroyer)
  //   );
  // }

  public async startLiveStream() {
    // if (!this.activeStreamChannel?.stream) {
    //   return;
    // }
    //
    // if (!this.rtcpPeerConnection) {
    //   this.createRTCPConnection();
    // }
    //
    // const stream: MediaStream = this.activeStreamChannel.stream;
    // stream.getTracks().forEach((track: MediaStreamTrack) => {
    //   this.rtcpPeerConnection.addTrack(track, stream);
    // });
    //
    // this.rtcpPeerConnection.createOffer().then(d => this.rtcpPeerConnection.setLocalDescription(d)).catch(log);
    //
    // this.rtcpPeerConnection.oniceconnectionstatechange = e => log(this.rtcpPeerConnection.iceConnectionState);
    // this.rtcpPeerConnection.onicecandidate = event => {
    //   if (event.candidate === null) {
    //     const localDescription: string = btoa(JSON.stringify(this.rtcpPeerConnection.localDescription));
    //     this.getRemoteSessionDescription(localDescription).subscribe((remoteSessionDescription) => {
    //       if (remoteSessionDescription === '') {
    //         return alert('Session Description must not be empty');
    //       }
    //
    //       try {
    //         this.rtcpPeerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteSessionDescription))));
    //         this.isLiveSteaming = true;
    //       } catch (e) {
    //         alert(e);
    //       }
    //     });
    //
    //   }
    // };
    console.log('sending stream');
    await this.secondWindow.removeStream();
    await this.mainWindow.removeStream();
    this.mainWindow.attachStream(this.activeStreamChannel.stream);
    this.mainWindow.sendStream('secondWindow');
  }

  public stopLiveStream(): void {
    this.isLiveSteaming = false;
    this.activeStreamChannel = null;

    this.currentBackground = 'assets/images/background.jpg';
    this.animateBackground();
    setTimeout(() => {
      this.previousBackground = this.activeStreamChannel.preview;
    }, 2000);
    document.getElementById('active-container').innerHTML = '';


    const mainWindow = new WindowPeerConnection('mainWindow');
    mainWindow.removeStream();
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
  const el = document.createElement('video');
  el.srcObject = video;
  el.autoplay = true;
  el.muted = true;
  el.width = 160;
  el.height = 120;

  parent.prepend(el);

  return el;
}



