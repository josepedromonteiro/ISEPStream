import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { StreamChannel } from '../../../home/home.page';
import { BannerData } from '../../../components/banner/banner/banner.component';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {

  public streamingContent: Subject<MediaStream>;
  public onStopSharing: Subject<boolean>;
  public onChangeStreamChanel: Subject<StreamChannel>;

  constructor() {
    this.streamingContent = new Subject<MediaStream>();
    this.onStopSharing = new Subject<boolean>();
    this.onChangeStreamChanel = new Subject<StreamChannel>();
  }
}
