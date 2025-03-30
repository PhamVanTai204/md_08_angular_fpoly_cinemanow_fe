import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { ThongKeComponent } from './thong-ke.component';

const routes: Routes = [
  {
    path: '',
    component: ThongKeComponent
  }
];

@NgModule({
  declarations: [ThongKeComponent],
  imports: [
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)]
    RouterModule.forChild(routes)
  ]
})
export class ThongKeModule { }