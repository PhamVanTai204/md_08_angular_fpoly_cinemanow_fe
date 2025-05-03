import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LichChieuComponent } from './lich-chieu.component';

const routes: Routes = [
  {
    path: '',
    component: LichChieuComponent
  }
];

@NgModule({
  declarations: [
    LichChieuComponent
  ],
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