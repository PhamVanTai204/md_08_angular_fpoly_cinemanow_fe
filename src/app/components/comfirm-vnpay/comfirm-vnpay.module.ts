import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComfirmVNPayRoutingModule } from './comfirm-vnpay-routing.module';
import { ComfirmVNPayComponent } from './comfirm-vnpay.component';


@NgModule({
  declarations: [ComfirmVNPayComponent],
  imports: [
    CommonModule,
    ComfirmVNPayRoutingModule
  ]
})
export class ComfirmVNPayModule { }
