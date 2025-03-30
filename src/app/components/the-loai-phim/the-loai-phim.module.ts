import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { TheLoaiPhimComponent } from './the-loai-phim.component';

const routes: Routes = [
  {
    path: '',
    component: TheLoaiPhimComponent
  }
];

@NgModule({
  declarations: [TheLoaiPhimComponent],
  imports: [
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)]
    RouterModule.forChild(routes)
  ]
})
export class TheLoaiPhimModule { }