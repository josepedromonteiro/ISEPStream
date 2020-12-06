import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { StreamingService } from './streaming.service';
// const WindowPeerConnection = require('electron-peer-connection').WindowPeerConnection;

declare var WindowPeerConnection;


@Component({
  selector: 'app-stream-area',
  templateUrl: './stream-area.component.html',
  styleUrls: ['./stream-area.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StreamAreaComponent implements OnInit {

  @ViewChild('videoElement') videoElement: ElementRef;

  constructor() {
  }

  ngOnInit() {
    setTimeout(() => {
      const secondWindow = new WindowPeerConnection('secondWindow');
      secondWindow.onReceivedStream((stream) => {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.autoplay = true;
        this.videoElement.nativeElement.muted = true;
      });
    }, 10000);

  }

}
