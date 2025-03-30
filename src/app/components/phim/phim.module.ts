import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { PhimComponent } from './phim.component';

const routes: Routes = [
  {
    path: '',
    component: PhimComponent
  }
];

@NgModule({
  declarations: [PhimComponent],
  imports: [
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)] và [ngClass]
    RouterModule.forChild(routes)
  ]
})
export class PhimModule { }