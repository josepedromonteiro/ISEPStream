import { AfterViewInit, Component, HostListener, OnDestroy, ViewEncapsulation } from '@angular/core';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';

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
  private rtcpPeerConnection: RTCPeerConnection;
  private isLiveSteaming = false;
  private destroyer: Subject<void>;
  public previousBackground: string;
  public currentBackground: string;
  public animatingBackground = false;

  constructor(private http: HttpClient,
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
  }

  ngAfterViewInit(): void {
    this.previousBackground = 'assets/images/background.jpg';
  }

  private createRTCPConnection() {
    this.rtcpPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    });
  }

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
          // appendWebcam(event.stream, canvasMediaContainer);
          break;
      }
    }, 500);

    this.currentBackground = this.activeStreamChannel.preview;
    this.animateBackground();
    setTimeout(() => {
      this.previousBackground = this.activeStreamChannel.preview;
    }, 2000);
  }


  private getRemoteSessionDescription(localSessionDescription: string): Observable<string> {
    const url = 'http://localhost:3000/keys';
    const body = {
      streamKey: localSessionDescription
    };

    return this.http.post<string>(url, body, { responseType: 'text' as 'json' }).pipe(
      takeUntil(this.destroyer)
    );
  }

  public async streamToTwitch() {
    if (!this.activeStreamChannel?.stream) {
      console.error('No active stream');
      return;
    }

    if (!this.rtcpPeerConnection) {
      console.error('No active rtcp');
      this.createRTCPConnection();
    }

    const stream: MediaStream = this.activeStreamChannel.stream;
    stream.getTracks().forEach((track: MediaStreamTrack) => {
      this.rtcpPeerConnection.addTrack(track, stream);
    });

    this.rtcpPeerConnection.createOffer().then(d => this.rtcpPeerConnection.setLocalDescription(d)).catch(log);

    this.rtcpPeerConnection.oniceconnectionstatechange = e => log(this.rtcpPeerConnection.iceConnectionState);
    this.rtcpPeerConnection.onicecandidate = event => {
      if (event.candidate === null) {
        console.log('e', event);
        const localDescription: string = btoa(JSON.stringify(this.rtcpPeerConnection.localDescription));
        this.getRemoteSessionDescription(localDescription).subscribe((remoteSessionDescription) => {
          if (remoteSessionDescription === '') {
            return alert('Session Description must not be empty');
          }

          try {
            this.rtcpPeerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteSessionDescription))));
            console.log(remoteSessionDescription);
            this.isLiveSteaming = true;
          } catch (e) {
            alert(e);
          }
        });

      }
    };
  }

  public stopTwitchStream(): void {
    this.rtcpPeerConnection.close();
    this.isLiveSteaming = false;
    this.rtcpPeerConnection = null;
    this.activeStreamChannel = null;

    this.currentBackground = 'assets/images/background.jpg';
    this.animateBackground();
    setTimeout(() => {
      this.previousBackground = this.activeStreamChannel.preview;
    }, 2000);
    document.getElementById('active-container').innerHTML = '';
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

  // const audioCtx = element.player.audio.destination.context;
  // const track = audioCtx.createMediaStreamDestination().stream.getAudioTracks()[0];
  //
  // const video = document.createElement('video') as any;
  // video.srcObject = stream;
  //
  // const videoStream = video.captureStream();
  //
  // videoStream.addTrack(track);

  return stream;
}


export function initWebcam(parentElement: HTMLElement): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream: MediaStream) => {
      appendWebcam(stream, parentElement);
      console.log(stream.getTracks()[1].getConstraints());
      console.log(stream.getTracks()[1].getCapabilities());
      console.log(stream.getTracks()[1].getSettings());
      return stream;
    }).catch((err) => {
      console.error(err);
      return null;
    });
}


export function initScreenShare(parentElement: HTMLElement, electronService: ElectronService): Promise<MediaStream> {
  // return (navigator.mediaDevices as any).getDisplayMedia({
  //   audio: true,
  //   video: true
  // }).then((stream: MediaStream) => {
  //   appendWebcam(stream, parentElement);
  //   console.log(stream.getTracks()[0].getConstraints());
  //   console.log(stream.getTracks()[0].getCapabilities());
  //   console.log(stream.getTracks()[0].getSettings());
  //   return stream;
  // });

  return electronService.desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    for (const source of sources) {
      console.log(source);
      if (source.name === 'Electron') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
          });
          return stream;
        } catch (e) {
          console.error(e);
        }
        return null;
      }
    }
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



