import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { ThanhToanComponent } from './thanh-toan.component';
import { CurrencyPipe } from '@angular/common';  // Để sử dụng currency pipe
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
const routes: Routes = [
  {
    path: '',
    component: ThanhToanComponent
  }
];

@NgModule({
  declarations: [ThanhToanComponent],
  imports: [
    PaginatorModule,
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)] và [ngClass]
    RouterModule.forChild(routes)
  ],
  providers: [
    CurrencyPipe  // Để sử dụng currency pipe
  ]
})
export class ThanhToanModule { }