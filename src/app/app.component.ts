import { AfterViewInit, Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private electronService: ElectronService
  ) {
    this.initializeApp();
  }

  ngAfterViewInit(): void {
    if (this.electronService.isWindows) {
      const isDark = window.matchMedia('(prefers-color-scheme:dark)').matches
      this.electronService.ipcRenderer.send('changeTheme', isDark)

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        this.electronService.ipcRenderer.send('changeTheme', event.matches)
      });
    } else {
      document.getElementById('titlebar').remove();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
