import { v4 as uuidv4 } from 'uuid';
import { ElectronService } from 'ngx-electron';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EXTENSIONS } from '../components/playlist/playlist.component';

const fs = window.require && window.require('electron').remote.require('fs');

export class Playlist {
  public name: string;
  public path: string;
  public files: BehaviorSubject<File[]>;
  public id: string;

  constructor(private electronService: ElectronService, name: string, path: string,
              private detectChanges: ChangeDetectorRef) {
    this.id = uuidv4();
    this.name = name;
    this.path = path;
    this.files = new BehaviorSubject<File[]>([]);
  }

  readFolder = () => {
    fs.readdirSync(this.path).forEach((fileName: any) => {
      const file: File = new File(fileName, this.electronService.isWindows ? `${this.path}\\${fileName}` : `${this.path}/${fileName}`);

      if (fs.statSync(file.path).isDirectory()) {
        return;
      }


      if (isFileValid(file)) {
        this.files.next([...this.files.getValue(), file]);
        this.detectChanges.markForCheck();
      }
    });
  };

  readLink = () => {
    const file = new File(this.name, this.path);
    this.files.next([...this.files.getValue(), file]);
  };

  removeFile(name: string): void {
    const elem: number = this.files.getValue().indexOf(this.files.getValue().filter(f => f.name === name)[0]);
    this.files.getValue().splice(elem, 1);
    this.files.next([...this.files.getValue()]);
  }
}

export class File {
  name: string;
  path: string;

  constructor(name: string, path: string) {
    this.path = path;
    this.name = name;
  }
}

function isFileValid(file: File): boolean {
  let valid: boolean = false;
  EXTENSIONS.forEach((extension) => {
    if (file.name.includes(`.${extension}`)) {
      valid = true;
    }
  });
  return valid;
}
