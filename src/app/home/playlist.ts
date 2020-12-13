var fs = window.require('electron').remote.require('fs');

export class Playlist {
  name: string;
  path: string;
  files: File[];

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
    this.files = [];
  }

  readFolder = () => {
    fs.readdirSync(this.path).forEach((fileName: any) => {
      let file = new File(fileName, `${this.path}\\${fileName}`);

      if (fs.statSync(file.path).isDirectory()) {
        return;
      }

      this.files.push(file);
    });
  };

  readLink = () => {
    let file = new File(this.name, this.path);
    this.files.push(file);
  }
}

class File {
  name: string;
  path: string;

  constructor(name: string, path: string) {
    this.path = path;
    this.name = name;
  }
}
