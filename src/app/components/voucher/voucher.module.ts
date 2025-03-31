import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoucherComponent } from './voucher.component';
import { VoucherRoutingModule } from './voucher-routing.module';

@NgModule({
  declarations: [VoucherComponent],
  imports: [
    CommonModule,
    FormsModule,
    VoucherRoutingModule
  ]
})
export class VoucherModule { }