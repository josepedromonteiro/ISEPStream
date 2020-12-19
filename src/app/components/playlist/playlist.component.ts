import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Playlist } from '../../home/playlist';
import { IonItemOptions, IonItemSliding, ModalController } from '@ionic/angular';
import { PlaylistModalComponent } from '../playlist-modal/playlist-modal.component';
import { iosEnterAnimation, iosLeaveAnimation } from '../screen-share/screen-share.animations';
import { ElectronService } from 'ngx-electron';
import { File } from '../../home/playlist';
import { FileFilter } from 'electron';

export const EXTENSIONS: string[] = ['mp4', 'ogv', 'webm'];

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlaylistComponent implements OnInit {

  public playlists: Playlist[] = [];
  public activePlaylist: Playlist;
  public optionsOpened: boolean = false;
  public playlistActive: boolean = false;
  public autoplay: boolean = false;
  public activeVideo: File;

  @Output() sendToStage: EventEmitter<File> = new EventEmitter<File>();
  @Output() stopStreaming: EventEmitter<File> = new EventEmitter<File>();

  constructor(private modalController: ModalController,
              private electronService: ElectronService,
              private detectChanges: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (!this.electronService.isElectronApp) {
      return;
    }
    this.electronService.ipcRenderer.on('videoEnded', (event: Electron.IpcRendererEvent, hasEnded: string) => {
      if (!hasEnded) {
        return;
      }

      if (this.activeVideo && this.autoplay) {
        const activeVideoIndex: number = this.activePlaylist?.files?.getValue()?.indexOf(this.activeVideo);
        console.log(activeVideoIndex);
        if (activeVideoIndex === -1) {
          this.playlistActive = false;
          return;
        }

        console.log(this.activePlaylist.files.getValue());

        if (activeVideoIndex + 1 >= this.activePlaylist?.files?.getValue()?.length) {
          this.stream(null, this.activePlaylist?.files?.getValue()[0]);
        } else {
          this.stream(null, this.activePlaylist?.files?.getValue()[activeVideoIndex + 1]);
        }
      }
    });
  }

  public async createPlaylist(): Promise<void> {

    const modal = await this.modalController.create({
      component: PlaylistModalComponent,
      cssClass: 'new-modal',
      enterAnimation: iosEnterAnimation,
      leaveAnimation: iosLeaveAnimation,
      componentProps: {
        openLocalFiles: this.addLocalPlaylist.bind(this),
        addYoutubeFiles: this.addWebPlaylist.bind(this)
      }
    });

    modal.present();

    const playlist: Playlist = (await modal.onWillDismiss()).data;
    if (playlist) {
      this.playlists.push(playlist);
      this.openPlaylist(playlist.id);
    }
  }


  public addLocalPlaylist(name?: string): Playlist {
    const filters: FileFilter[] = [{
      name: 'Movies',
      extensions: EXTENSIONS
    }];
    const directory = this.electronService.remote.dialog.showOpenDialogSync({
      title: 'Playlist file picker',
      buttonLabel: 'Add to playlist',
      properties: ['openDirectory'],
      filters
    });
    if (directory && directory[0]) {
      let playlistName: string;
      let directorySplit: string[];
      if (this.electronService.isWindows) {
        directorySplit = directory[0].split('\\');
      } else {
        directorySplit = directory[0].split('/');
      }
      playlistName = name || directorySplit[directorySplit.length - 1];

      const playlist = new Playlist(this.electronService, playlistName, directory[0], this.detectChanges);
      playlist.readFolder();

      return playlist;
    }
  }

  public addWebPlaylist(): void {
    const link = 'https://www.youtube.com/embed/Bi37HFrAYyw?autoplay=1?controls=0';

    if (link) {
      const playlist: Playlist = new Playlist(this.electronService, link, link, this.detectChanges);
      playlist.readLink();

      this.playlists.push(playlist);
    }
  }

  public openPlaylist(id: string): void {
    this.activePlaylist = this.playlists.filter(p => p.id === id)[0];
  }

  public async swapItem(item: IonItemSliding): Promise<void> {
    const sr: number = await item.getSlidingRatio();
    if (sr > 0) {
      item.close();
    } else {
      item.open(undefined);
    }
  }

  public stream(item: IonItemSliding, file: File): void {
    console.log(file);
    this.playlistActive = true;
    this.activeVideo = file;
    this.sendToStage.emit(this.activeVideo);
    if (item) {
      item.close();
    }
  }

  public remove(item: IonItemSliding, name: string): void {
    this.activePlaylist.removeFile(name);
    if (item) {
      item.close();
    }
  }

  public openOptions(): void {
    this.optionsOpened = !this.optionsOpened;
  }

  public removePlaylist(): void {
    this.playlists.splice(this.playlists.indexOf(this.activePlaylist), 1);
    if (this.playlists[0]) {
      this.activePlaylist = this.playlists[0];
    } else {
      this.activePlaylist = null;
    }
    this.optionsOpened = false;
  }

  public stopStream(itemSliding: IonItemSliding, item: File): void {
    this.playlistActive = false;
    this.activeVideo = null;
    this.stopStreaming.emit(item);
    itemSliding.close();
  }
}
