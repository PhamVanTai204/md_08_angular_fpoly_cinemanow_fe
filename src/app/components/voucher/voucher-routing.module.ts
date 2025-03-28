import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoucherComponent } from './voucher.component';

const routes: Routes = [
  { path: '', component: VoucherComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VoucherRoutingModule { }
