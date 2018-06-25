import { Component, OnInit } from '@angular/core';

import {
  AngularFireStorage,
  AngularFireUploadTask
} from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { DocumentSnapshot } from 'angularfire2/firestore';
import { UploadTaskSnapshot } from 'angularfire2/storage/interfaces';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  private task: AngularFireUploadTask;

  private pct: Observable<number>;

  private snapshot: Observable<any>;

  private downloadUrl: Observable<string>;

  private isHovered: boolean;

  constructor(private storage: AngularFireStorage) {}

  ngOnInit() {}

  startUpload(event: FileList): void {
    const file = event.item(0);
    const fileType = file.type.split('/')[0];

    if (fileType !== 'image') {
      console.error(`Unsupported file type (${fileType}) :-( :`);
      return;
    }

    const path = `test/${new Date().getTime()}_${file.name}`;

    const customMetadata = { app: 'MY AngularFire-powered PWA' };

    this.task = this.storage.upload(path, file, { customMetadata });
    this.snapshot = this.task.snapshotChanges();
    this.pct = this.task.percentageChanges();

    // The file's download URL
    // this.downloadUrl = this.task.downloadURL();
  }

  isActive(snapshot: UploadTaskSnapshot): boolean {
    return (
      snapshot.state === 'running' &&
      snapshot.bytesTransferred < snapshot.totalBytes
    );
  }
}
