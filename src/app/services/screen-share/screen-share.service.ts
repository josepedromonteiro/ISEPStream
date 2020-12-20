import { EventEmitter, Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ModalController } from '@ionic/angular';
import { ScreenShareComponent, Source } from '../../components/screen-share/screen-share.component';
import { DesktopCapturerSource } from 'electron';
import { appendWebcam } from '../../home/home.page';
import { Subject } from 'rxjs';
import { iosEnterAnimation, iosLeaveAnimation } from '../../components/screen-share/screen-share.animations';

export interface Stream {
  id: string;
  stream: MediaStream;
}

@Injectable({
  providedIn: 'root'
})
export class ScreenShareService {

  private modal: HTMLIonModalElement;
  private parentElement: HTMLElement;
  public onStreamActive: Subject<Stream>;

  constructor(private electronService: ElectronService,
              private modalController: ModalController) {
    this.onStreamActive = new Subject<Stream>();
  }

  public initScreenShare(id: string, parentElement: HTMLElement): Promise<void> {
    this.parentElement = parentElement;
    return this.electronService.desktopCapturer
      .getSources({ types: ['window', 'screen'] }).then(async (sources: DesktopCapturerSource[]) => {
        this.electronService.remote.getGlobal('mainWindow').focus();
        this.openModal(id, sources);
      });
  }

  public async onSelectSource(id: string, source: Source) {
    try {

      const stream = await this.getSourceStream(source);
      appendWebcam(stream, this.parentElement);
      this.onStreamActive.next({ id, stream });
      this.closeModal();

    } catch (e) {
      console.error(e);
      this.closeModal();
      this.onStreamActive.next({ id, stream: null });
    }
  }

  public getSourceStream(source: Source): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      return (navigator as any).getUserMedia(
        {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id
            }
          }
        }
        , (stream) => {
          return resolve(stream);
        },
        (err) => {
          return reject(err);
        });
    });

  }

  private async openModal(id: string, sources: DesktopCapturerSource[]): Promise<void> {
    this.modal = await this.modalController.create({
      component: ScreenShareComponent,
      cssClass: 'new-modal',
      enterAnimation: iosEnterAnimation,
      leaveAnimation: iosLeaveAnimation,
      componentProps: {
        sources,
        id
      }
    });
    this.modal.present();
  }

  public closeModal(): void {
    this.modal.dismiss();
  }
}

