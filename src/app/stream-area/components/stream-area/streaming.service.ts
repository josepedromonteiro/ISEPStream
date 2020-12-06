import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {

  public streamingContent: Subject<MediaStream>;

  constructor() {
    this.streamingContent = new Subject<MediaStream>();
  }
}
