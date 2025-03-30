import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { VoucherComponent } from './voucher.component';

const routes: Routes = [
  {
    path: '',
    component: VoucherComponent
  }
];

@NgModule({
  declarations: [VoucherComponent],
  imports: [
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)]
    RouterModule.forChild(routes)
  ]
})
export class VoucherModule { }