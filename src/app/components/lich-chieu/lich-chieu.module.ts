import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { LichChieuComponent } from './lich-chieu.component';
import { DatePipe } from '@angular/common';  // Để sử dụng date pipe

const routes: Routes = [
  {
    path: '',
    component: LichChieuComponent
  }
];

@NgModule({
  declarations: [LichChieuComponent],
  imports: [
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)]
    RouterModule.forChild(routes)
  ],
  providers: [
    DatePipe  // Để sử dụng date pipe
  ]
})
export class LichChieuModule { }