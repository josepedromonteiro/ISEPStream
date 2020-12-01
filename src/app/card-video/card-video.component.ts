import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { appendWebcam, initIPCamera, initScreenShare, initWebcam, StreamChannel } from '../home/home.page';

@Component({
  selector: 'app-card-video',
  templateUrl: './card-video.component.html',
  styleUrls: ['./card-video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardVideoComponent implements OnInit, AfterViewInit {

  @Output() sendToStream: EventEmitter<StreamChannel> = new EventEmitter<StreamChannel>();
  @Input() streamChannel: StreamChannel;
  public isScreenShare = false;
  public isSharing = false;

  constructor() {
  }

  async ngAfterViewInit(): Promise<void> {

    if (this.streamChannel.type === 'ip-camera') {
      const canvas: any = document.getElementById('media-container-' + this.streamChannel.id) as HTMLCanvasElement;
      this.streamChannel.stream = initIPCamera('ws://localhost:9999', canvas);
      this.isSharing = true;
    }

    if (this.streamChannel.type === 'webcam') {
      const canvas: any = document.getElementById('media-container-' + this.streamChannel.id) as HTMLCanvasElement;
      this.streamChannel.stream = await initWebcam(canvas);
      this.isSharing = true;
    }

    if (this.streamChannel.type === 'screen-share') {
      this.isScreenShare = true;
    }
  }

  ngOnInit() {
  }

  public async startSharing(): Promise<void> {
    const canvas: any = document.getElementById('media-container-' + this.streamChannel.id) as HTMLCanvasElement;
    try {
      this.streamChannel.stream = await initScreenShare(canvas);
      this.isSharing = true;
    } catch (e) {
      console.warn(e);
    }
  }

}
