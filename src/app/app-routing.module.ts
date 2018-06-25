import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FileUploadComponent } from './file-upload/file-upload.component';

const routes: Routes = [
  { path: '', component: FileUploadComponent },
  { path: 'upload', component: FileUploadComponent }
];

@NgModule({
  imports: [],
  declarations: []
})
export class AppRoutingModule {}
