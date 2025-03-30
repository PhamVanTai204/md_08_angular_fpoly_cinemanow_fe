import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { NguoiDungComponent } from './nguoi-dung.component';
import { DatePipe } from '@angular/common';  // Để sử dụng date pipe

const routes: Routes = [
  {
    path: '',
    component: NguoiDungComponent
  }
];

@NgModule({
  declarations: [NguoiDungComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    DatePipe  // Để sử dụng date pipe
  ]
})
export class NguoiDungModule { }