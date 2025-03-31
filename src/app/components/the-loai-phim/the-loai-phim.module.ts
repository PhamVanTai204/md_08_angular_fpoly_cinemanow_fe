import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TheLoaiPhimComponent } from './the-loai-phim.component';

@NgModule({
  declarations: [TheLoaiPhimComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: TheLoaiPhimComponent }
    ])
  ]
})
export class TheLoaiPhimModule { }