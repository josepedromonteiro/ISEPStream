import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { initIPCamera, initWebcam, StreamChannel } from '../home/home.page';
import { ElectronService } from 'ngx-electron';
import { ScreenShareService, Stream } from '../services/screen-share/screen-share.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { StreamingService } from '../stream-area/components/stream-area/streaming.service';

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
  public inStage = false;
  private destroyer: Subject<void> = new Subject<void>();

  constructor(private electronService: ElectronService,
              private screenShareService: ScreenShareService,
              private streamingService: StreamingService) {
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
    this.streamingService.onStopSharing.pipe(
      takeUntil(this.destroyer)
    ).subscribe((stoped: boolean) => {
      if (stoped) {
        this.inStage = false;
      }
    });

    this.streamingService.onChangeStreamChanel.pipe(
      takeUntil(this.destroyer)
    ).subscribe((activeChannel: StreamChannel) => {
      if (this.streamChannel.id !== activeChannel.id) {
        this.inStage = false;
      }
    });
  }

  public async startSharing(): Promise<void> {
    const canvas: any = document.getElementById('media-container-' + this.streamChannel.id) as HTMLCanvasElement;
    try {
      await this.screenShareService.initScreenShare(this.streamChannel.id, canvas);
      this.screenShareService.onStreamActive
        .pipe(take(1))
        .subscribe((stream: Stream) => {
          if (this.streamChannel.id === stream.id) {
            this.streamChannel.stream = stream.stream;
            this.isSharing = true;

            if (this.inStage) {
              this.sendElementToStream(this.streamChannel);
            }
          }
        });
    } catch (e) {
      console.warn(e);
    }
  }

  public ngOnDestroy(): void {
    this.destroyer.complete();
  }

  public sendElementToStream(streamChannel: StreamChannel): void {
    this.sendToStream.emit(streamChannel);
    this.inStage = true;
  }

}
