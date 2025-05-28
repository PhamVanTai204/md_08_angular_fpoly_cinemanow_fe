import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { ThongKeComponent } from './thong-ke.component';
import { ChartModule } from 'primeng/chart';
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
    RouterModule.forChild(routes),
    ChartModule
  ]
})
export class ThongKeModule { }