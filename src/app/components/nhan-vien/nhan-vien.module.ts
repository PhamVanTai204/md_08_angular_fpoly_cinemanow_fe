import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NhanVienComponent } from './nhan-vien.component';

const routes: Routes = [
  {
    path: '',
    component: NhanVienComponent
  }
];

@NgModule({
  declarations: [NhanVienComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class NhanVienModule { }