import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { appendWebcam, initIPCamera, initWebcam, StreamChannel } from '../home/home.page';

@Component({
  selector: 'app-card-video',
  templateUrl: './card-video.component.html',
  styleUrls: ['./card-video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardVideoComponent implements OnInit, AfterViewInit {

  @Output() sendToStream: EventEmitter<StreamChannel> = new EventEmitter<StreamChannel>();
  @Input() streamChannel: StreamChannel;

  constructor() {
  }

  async ngAfterViewInit(): Promise<void> {

    if (this.streamChannel.type === 'ip-camera') {
      const canvas: any = document.getElementById(this.streamChannel.id) as HTMLCanvasElement;
      this.streamChannel.stream = initIPCamera('ws://localhost:9999', canvas);
    }

    if (this.streamChannel.type === 'webcam') {
      const canvas: any = document.getElementById('media-container-' + this.streamChannel.id) as HTMLCanvasElement;
      this.streamChannel.stream = await initWebcam(canvas);
    }
  }

  ngOnInit() {
  }

}
