import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Playlist } from '../../home/playlist';
import { ElectronService } from 'ngx-electron';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface PlaylistData {

}

@Component({
  selector: 'app-playlist-modal',
  templateUrl: './playlist-modal.component.html',
  styleUrls: ['./playlist-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlaylistModalComponent implements OnInit {

  private openLocalFiles: (name?: string) => Playlist;
  public playlist: Playlist;
  private path: string;
  public form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private electronService: ElectronService,
              private detectChanges: ChangeDetectorRef) {
    this.openLocalFiles = this.navParams.get('openLocalFiles');
  }

  ngOnInit() {
  }

  closeModal() {
    this.modalController.dismiss();
  }

  public openParentLocalFiles(): void {
    this.playlist = this.openLocalFiles(this.form.get('name').value);
  }

  confirm() {
    const name: string = this.form.get('name').value;
    if (!name || name.length === 0) {
      return;
    }
    if (!this.playlist) {
      console.log('no pl');
      this.playlist = new Playlist(this.electronService, name, this.path, this.detectChanges);
    }
    this.playlist.name = name;
    console.log(this.playlist);
    this.modalController.dismiss(this.playlist);
  }
}
