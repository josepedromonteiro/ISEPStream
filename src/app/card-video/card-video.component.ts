import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { initIPCamera, initWebcam, StreamChannel } from '../home/home.page';
import { ElectronService } from 'ngx-electron';
import { ScreenShareService, Stream } from '../services/screen-share/screen-share.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-card-video',
  templateUrl: './card-video.component.html',
  styleUrls: ['./card-video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardVideoComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() sendToStream: EventEmitter<StreamChannel> = new EventEmitter<StreamChannel>();
  @Input() streamChannel: StreamChannel;
  public isScreenShare = false;
  public isSharing = false;
  private destroyer: Subject<void> = new Subject<void>();

  constructor(private electronService: ElectronService,
              private screenShareService: ScreenShareService) {
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
      await this.screenShareService.initScreenShare(this.streamChannel.id, canvas);
      this.screenShareService.onStreamActive
        .pipe(takeUntil(this.destroyer))
        .subscribe((stream: Stream) => {
          if (this.streamChannel.id === stream.id) {
            this.streamChannel.stream = stream.stream;
            this.isSharing = true;
          }
        });
    } catch (e) {
      console.warn(e);
    }
  }

  public ngOnDestroy(): void {
    this.destroyer.complete();
  }

}
