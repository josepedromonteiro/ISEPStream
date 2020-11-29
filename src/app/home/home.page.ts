import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ONVIFService } from 'onvif-rx-angular';
import { IManagedDevice, StreamType, TransportProtocol } from 'onvif-rx';
import JSMpeg from 'jsmpeg-player';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type StreamChannelType = 'webcam' | 'ip-camera';

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
  private isLiveSteaming: boolean = false;
  private destroyer: Subject<void>;

  constructor(private http: HttpClient) {

    this.channels = [
      {
        id: 'webcam',
        name: 'Local Camera',
        preview: '',
        type: 'webcam'
      },
      {
        id: 'ipvideo',
        name: 'IP Camera',
        preview: '',
        url: 'ws://localhost:9999',
        type: 'ip-camera'
      },
      {
        id: 'webcam-2',
        name: 'Local Camera',
        preview: '',
        type: 'webcam'
      },
    ];

    // this.activeStreamChannel = this.channels[0];
    this.destroyer = new Subject();
  }

  ngAfterViewInit(): void {
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
      switch (event.type) {
        case 'ip-camera':
          const canvas: any = document.getElementById('video') as HTMLCanvasElement;
          initIPCamera(event.url, canvas);
          break;
        case 'webcam':
          const canvasMediaContainer: any = document.getElementById('media-container') as HTMLCanvasElement;
          appendWebcam(event.stream, canvasMediaContainer);
          break;
      }
    }, 500);
  }

  public stopStreaming(): void {
    this.activeStreamChannel = null;
  }


  public streamTo() {
    // const log = msg => {
    //   document.getElementById('logs').innerHTML += msg + '<br>';
    // };
    // const displayVideo = video => {
    //   const el = document.createElement('video');
    //   el.srcObject = video;
    //   el.autoplay = true;
    //   el.muted = true;
    //   el.width = 160;
    //   el.height = 120;
    //
    //   document.getElementById('localVideos').appendChild(el);
    //   return video;
    // };


    // navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    //   .then((stream: MediaStream) => {
    //     stream.getTracks().forEach((track: MediaStreamTrack) => {
    //       this.rtcpPeerConnection.addTrack(track, stream);
    //     });
    //
    //     displayVideo(stream);
    //     this.rtcpPeerConnection.createOffer().then(d => this.rtcpPeerConnection.setLocalDescription(d)).catch(log);
    //   }).catch(log);

    // this.rtcpPeerConnection.oniceconnectionstatechange = e => log(this.rtcpPeerConnection.iceConnectionState);
    // this.rtcpPeerConnection.onicecandidate = event => {
    //   if (event.candidate === null) {
    // document.getElementById('localSessionDescription').value = btoa(JSON.stringify(pc.localDescription));
    //   }
    // };

    const startSession = () => {
      // let sd = document.getElementById('remoteSessionDescription').value;
      // if (sd === '') {
      //   return alert('Session Description must not be empty');
      // }

      // try {
      //   pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(sd))));
      // } catch (e) {
      //   alert(e);
      // }
    };
    //
    // const addDisplayCapture = () => {
    //   navigator.mediaDevices.getDisplayMedia().then(stream => {
    //     document.getElementById('displayCapture').disabled = true;
    //
    //     stream.getTracks().forEach((track: MediaStreamTrack) => {
    //       pc.addTrack(track, displayVideo(stream));
    //     });
    //
    //     pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log);
    //   });
    // };

  }

  private getRemoteSessionDescription(localSessionDescription: string): Observable<string> {
    const url: string = 'http://localhost:3000/keys';
    const body = {
      streamKey: localSessionDescription
    };

    return this.http.post<string>(url, body, { responseType: 'text' as 'json' }).pipe(
      takeUntil(this.destroyer)
    );
  }

  public streamToTwitch() {
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
        const localDescription: string = btoa(JSON.stringify(this.rtcpPeerConnection.localDescription));
        this.getRemoteSessionDescription(localDescription).subscribe((remoteSessionDescription) => {
          if (remoteSessionDescription === '') {
            return alert('Session Description must not be empty');
          }

          try {
            this.rtcpPeerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(remoteSessionDescription))));
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
  }

  ngOnDestroy(): void {
    this.destroyer.next();
  }

}

export function log(message: string) {
  console.error(message);
}

export function initIPCamera(url: string, canvas: any): MediaStream {
  new JSMpeg.Player(url, {
    canvas
  });
  const stream = canvas.captureStream(30);

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

export function appendWebcam(video: MediaStream, parent: HTMLElement) {
  const el = document.createElement('video');
  el.srcObject = video;
  el.autoplay = true;
  el.muted = true;
  el.width = 160;
  el.height = 120;

  // parent.parentElement.replaceChild(parent, el);
  parent.prepend(el);
}
