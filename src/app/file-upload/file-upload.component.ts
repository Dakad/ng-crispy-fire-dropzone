import { Component, OnInit } from '@angular/core';

import {
  AngularFireStorage,
  AngularFireUploadTask,
  AngularFireStorageReference
} from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { DocumentSnapshot, AngularFirestore } from 'angularfire2/firestore';
import { UploadTaskSnapshot } from 'angularfire2/storage/interfaces';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  private task: AngularFireUploadTask; // Main task

  // Progress monitoring
  private percentage: Observable<number>;

  private snapshot: Observable<any>;

  // Download URL
  private downloadUrl: Observable<string>;

  // State for dropzone CSS toggling
  private isHovered: boolean;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore
  ) {}

  ngOnInit() {}

  startUpload(event: FileList): void {
    const file: File = event.item(0);

    if (file.type.split('/')[0] !== 'image') {
      console.error(`Unsupported file type (${file.type}) :-( :`);
      return;
    }

    const filePath: string = `pics/${new Date().getTime()}_${file.name}`;

    const customMetadata = { app: 'MY AngularFire-powered PWA' };

    // The main task
    const fileRef = this.storage.ref(filePath);
    this.task = this.storage.upload(filePath, file, { customMetadata });

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      // get notified when the download URL is available
      finalize(() => {
        this.downloadUrl = fileRef.getDownloadURL();
        this.downloadUrl.subscribe(url => {
          this.db.collection('pics').add({
            name: file.name,
            type: file.type.split('/')[1],
            year: file.lastModified,
            path: filePath,
            size: file.size,
            url,
            ...customMetadata
          });
        });
      })
    );

    // The file's download URL
    // this.downloadUrl = this.task.downloadURL();
  }

  // Determines if the upload task is active
  isActive(snapshot: UploadTaskSnapshot): boolean {
    return (
      snapshot.state === 'running' &&
      snapshot.bytesTransferred < snapshot.totalBytes
    );
  }
}
