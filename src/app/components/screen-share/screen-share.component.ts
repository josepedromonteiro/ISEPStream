import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { DesktopCapturerSource } from 'electron';
import { ScreenShareService } from '../../services/screen-share/screen-share.service';
import { NavParams } from '@ionic/angular';
import { appendWebcam } from '../../home/home.page';

export interface Source extends DesktopCapturerSource {
  image?: string;
}

@Component({
  selector: 'app-screen-share',
  templateUrl: './screen-share.component.html',
  styleUrls: ['./screen-share.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScreenShareComponent implements OnInit, AfterViewInit {

  @Input() id: string;
  @Output() selectedSource: EventEmitter<Source> = new EventEmitter<Source>();
  public sources: Source[] = [];

  constructor(public screenShareService: ScreenShareService,
              private navParams: NavParams) {
  }

  ngOnInit() {
  }

  public onSelectSource(source: Source) {
    this.screenShareService.onSelectSource(this.id, source);
  }

  public handleSources(sources: DesktopCapturerSource[]) {
    this.sources = sources;
    sources.forEach(async (source: Source) => {
      const sourceContainer = document.getElementById('container-' + source.id);
      const stream: MediaStream = await this.screenShareService.getSourceStream(source);
      appendWebcam(stream, sourceContainer);
    });
  }

  ngAfterViewInit(): void {
    const sources: DesktopCapturerSource[] = this.navParams.get('sources');
    setTimeout(() => {
      this.handleSources(sources);
    }, 500);
  }
}
